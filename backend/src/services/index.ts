import {
  gameRepository,
  libraryRepository,
  userRepository,
} from '../repositories';
import { AuthService } from './authService';
import { GamesService } from './gamesService';
import { LibraryService } from './libraryService';
import { ProfileService } from './profileService';

export const authService = new AuthService(userRepository);
export const gamesService = new GamesService();
export const libraryService = new LibraryService(
  libraryRepository,
  gameRepository,
  gamesService
);
export const profileService = new ProfileService(
  userRepository,
  libraryRepository
);

export { AuthService, GamesService, LibraryService, ProfileService };
