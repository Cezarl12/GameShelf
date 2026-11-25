import { InMemoryGameRepository } from '../../src/repositories/gameRepository';
import { InMemoryLibraryRepository } from '../../src/repositories/libraryRepository';
import { GamesService } from '../../src/services/gamesService';
import { LibraryService } from '../../src/services/libraryService';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../src/utils/errors';

describe('LibraryService', () => {
  let gameRepository: InMemoryGameRepository;
  let libraryRepository: InMemoryLibraryRepository;
  let mockGamesService: jest.Mocked<Pick<GamesService, 'getGameByRawgId'>>;
  let libraryService: LibraryService;

  beforeEach(() => {
    gameRepository = new InMemoryGameRepository();
    libraryRepository = new InMemoryLibraryRepository(gameRepository);
    mockGamesService = {
      getGameByRawgId: jest.fn().mockResolvedValue({
        rawgId: 3328,
        title: 'The Witcher 3',
        coverUrl: 'https://img.example.com/w3.jpg',
        platforms: ['PC', 'PS5'],
        releaseYear: 2015,
        genres: ['RPG'],
        description: 'RPG',
        metacritic: 92,
      }),
    };
    libraryService = new LibraryService(
      libraryRepository,
      gameRepository,
      mockGamesService as unknown as GamesService
    );
  });

  it('adds a game from RAWG to games table and user library', async () => {
    const item = await libraryService.addGame('user-1', 3328, 'PLAYING');

    expect(item.status).toBe('PLAYING');
    expect(item.game.title).toBe('The Witcher 3');
    expect(mockGamesService.getGameByRawgId).toHaveBeenCalledWith(3328);
  });

  it('throws ConflictError (409) when adding the same game twice for the same user', async () => {
    await libraryService.addGame('user-1', 3328, 'WANT_TO_PLAY');

    await expect(
      libraryService.addGame('user-1', 3328, 'PLAYING')
    ).rejects.toThrow(ConflictError);
  });

  it('throws BadRequestError (400) for invalid rating or overly long review', async () => {
    const item = await libraryService.addGame('user-1', 3328, 'PLAYING');

    await expect(
      libraryService.updateGame('user-1', item.id, { rating: 11 })
    ).rejects.toThrow(BadRequestError);

    await expect(
      libraryService.updateGame('user-1', item.id, { rating: 0 })
    ).rejects.toThrow(BadRequestError);

    await expect(
      libraryService.updateGame('user-1', item.id, {
        review: 'a'.repeat(1001),
      })
    ).rejects.toThrow(BadRequestError);
  });

  it('updates status, rating, and review for the owner', async () => {
    const item = await libraryService.addGame('user-1', 3328, 'PLAYING');
    const updated = await libraryService.updateGame('user-1', item.id, {
      status: 'COMPLETED',
      rating: 10,
      review: 'Capodoperă!',
    });

    expect(updated.status).toBe('COMPLETED');
    expect(updated.rating).toBe(10);
    expect(updated.review).toBe('Capodoperă!');
  });

  it('prevents another user from modifying or deleting a library item (403)', async () => {
    const item = await libraryService.addGame('user-1', 3328, 'PLAYING');

    await expect(
      libraryService.updateGame('user-2', item.id, { rating: 5 })
    ).rejects.toThrow(ForbiddenError);

    await expect(libraryService.deleteGame('user-2', item.id)).rejects.toThrow(
      ForbiddenError
    );
  });

  it('deletes a game from the owner library and throws 404 if missing', async () => {
    const item = await libraryService.addGame('user-1', 3328, 'PLAYING');
    await libraryService.deleteGame('user-1', item.id);

    await expect(libraryService.deleteGame('user-1', item.id)).rejects.toThrow(
      NotFoundError
    );
  });
});
