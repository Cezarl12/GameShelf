import { InMemoryGameRepository } from '../../src/repositories/gameRepository';
import { InMemoryLibraryRepository } from '../../src/repositories/libraryRepository';
import { InMemoryUserRepository } from '../../src/repositories/userRepository';
import { ProfileService } from '../../src/services/profileService';
import { NotFoundError } from '../../src/utils/errors';

describe('ProfileService', () => {
  let userRepository: InMemoryUserRepository;
  let gameRepository: InMemoryGameRepository;
  let libraryRepository: InMemoryLibraryRepository;
  let profileService: ProfileService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    gameRepository = new InMemoryGameRepository();
    libraryRepository = new InMemoryLibraryRepository(gameRepository);
    profileService = new ProfileService(userRepository, libraryRepository);
  });

  it('returns public profile without password_hash and updates profile fields', async () => {
    const user = await userRepository.create({
      email: 'profile@example.com',
      password_hash: 'hashed-secret',
      username: 'OldName',
    });

    const profile = await profileService.getProfile(user.id);
    expect(profile.username).toBe('OldName');
    expect(
      (profile as unknown as Record<string, unknown>).password_hash
    ).toBeUndefined();

    const updated = await profileService.updateProfile(user.id, {
      username: 'NewName',
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(updated.username).toBe('NewName');
    expect(updated.avatar_url).toBe('https://example.com/avatar.png');
  });

  it('computes profile stats by status and average rating', async () => {
    const user = await userRepository.create({
      email: 'stats@example.com',
      password_hash: 'hash',
      username: 'StatsUser',
    });

    const g1 = await gameRepository.create({
      rawg_id: 1,
      title: 'Game 1',
      cover_url: null,
      platform: 'PC',
      release_year: 2020,
      genres: 'RPG',
    });
    const g2 = await gameRepository.create({
      rawg_id: 2,
      title: 'Game 2',
      cover_url: null,
      platform: 'PS5',
      release_year: 2021,
      genres: 'Action',
    });

    const e1 = await libraryRepository.create({
      user_id: user.id,
      game_id: g1.id,
      status: 'COMPLETED',
    });
    await libraryRepository.update(e1.id, { rating: 8 });

    const e2 = await libraryRepository.create({
      user_id: user.id,
      game_id: g2.id,
      status: 'PLAYING',
    });
    await libraryRepository.update(e2.id, { rating: 10 });

    const stats = await profileService.getStats(user.id);
    expect(stats).toEqual({
      totalGames: 2,
      byStatus: {
        WANT_TO_PLAY: 0,
        PLAYING: 1,
        COMPLETED: 1,
      },
      averageRating: 9,
    });
  });

  it('deletes account and all associated library entries (GDPR)', async () => {
    const user = await userRepository.create({
      email: 'gdpr@example.com',
      password_hash: 'hash',
      username: 'DeleteMe',
    });
    const game = await gameRepository.create({
      rawg_id: 10,
      title: 'Game 10',
      cover_url: null,
      platform: 'PC',
      release_year: 2022,
      genres: 'Indie',
    });
    await libraryRepository.create({
      user_id: user.id,
      game_id: game.id,
      status: 'WANT_TO_PLAY',
    });

    await profileService.deleteAccount(user.id);

    await expect(profileService.getProfile(user.id)).rejects.toThrow(
      NotFoundError
    );
    const lib = await libraryRepository.findByUserId(user.id, {
      page: 1,
      limit: 20,
    });
    expect(lib.total).toBe(0);
  });
});
