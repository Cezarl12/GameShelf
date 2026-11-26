import { IGameRepository, ILibraryRepository } from '../repositories';
import {
  GameStatus,
  LibraryItem,
  LibraryQuery,
  PaginatedResult,
} from '../types';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';
import { GamesService } from './gamesService';

export class LibraryService {
  constructor(
    private readonly libraryRepository: ILibraryRepository,
    private readonly gameRepository: IGameRepository,
    private readonly gamesService: GamesService
  ) {}

  async getLibrary(
    userId: string,
    query: LibraryQuery
  ): Promise<PaginatedResult<LibraryItem>> {
    return this.libraryRepository.findByUserId(userId, query);
  }

  async addGame(
    userId: string,
    rawgId: number,
    status: GameStatus = 'WANT_TO_PLAY'
  ): Promise<LibraryItem> {
    let game = await this.gameRepository.findByRawgId(rawgId);
    if (!game) {
      const rawgDetails = await this.gamesService.getGameByRawgId(rawgId);
      game = await this.gameRepository.create({
        rawg_id: rawgDetails.rawgId,
        title: rawgDetails.title,
        cover_url: rawgDetails.coverUrl,
        platform: rawgDetails.platforms.join(', '),
        release_year: rawgDetails.releaseYear,
        genres: rawgDetails.genres.join(', '),
      });
    }

    const existing = await this.libraryRepository.findByUserAndGame(
      userId,
      game.id
    );
    if (existing) {
      throw new ConflictError('Jocul este deja în biblioteca ta');
    }

    return this.libraryRepository.create({
      user_id: userId,
      game_id: game.id,
      status,
    });
  }

  async updateGame(
    userId: string,
    itemId: string,
    data: {
      status?: GameStatus;
      rating?: number | null;
      review?: string | null;
    }
  ): Promise<LibraryItem> {
    if (
      data.rating !== undefined &&
      data.rating !== null &&
      (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 10)
    ) {
      throw new BadRequestError(
        'Nota trebuie să fie un număr întreg între 1 și 10'
      );
    }

    if (
      data.review !== undefined &&
      data.review !== null &&
      data.review.length > 1000
    ) {
      throw new BadRequestError(
        'Recenzia poate avea maximum 1000 de caractere'
      );
    }

    const existing = await this.libraryRepository.findById(itemId);
    if (!existing) {
      throw new NotFoundError('Jocul nu a fost găsit în bibliotecă');
    }
    if (existing.user_id !== userId) {
      throw new ForbiddenError('Nu aveți permisiunea să modificați acest joc');
    }

    const updated = await this.libraryRepository.update(itemId, data);
    if (!updated) {
      throw new NotFoundError('Jocul nu a fost găsit în bibliotecă');
    }
    return updated;
  }

  async deleteGame(userId: string, itemId: string): Promise<void> {
    const existing = await this.libraryRepository.findById(itemId);
    if (!existing) {
      throw new NotFoundError('Jocul nu a fost găsit în bibliotecă');
    }
    if (existing.user_id !== userId) {
      throw new ForbiddenError('Nu aveți permisiunea să ștergeți acest joc');
    }

    await this.libraryRepository.delete(itemId);
  }
}
