import { InMemoryGameRepository } from './gameRepository';
import { InMemoryLibraryRepository } from './libraryRepository';
import { InMemoryUserRepository } from './userRepository';

export const userRepository = new InMemoryUserRepository();
export const gameRepository = new InMemoryGameRepository();
export const libraryRepository = new InMemoryLibraryRepository(gameRepository);

export * from './interfaces';
export {
  InMemoryUserRepository,
  InMemoryGameRepository,
  InMemoryLibraryRepository,
};
