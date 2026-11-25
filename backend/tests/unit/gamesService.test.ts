import axios, { AxiosInstance } from 'axios';
import { GamesService } from '../../src/services/gamesService';
import { NotFoundError, ServiceUnavailableError } from '../../src/utils/errors';

describe('GamesService', () => {
  it('searches games via RAWG and caches results for subsequent identical queries', async () => {
    const mockGet = jest.fn().mockResolvedValue({
      data: {
        results: [
          {
            id: 3498,
            name: 'Grand Theft Auto V',
            background_image: 'https://img.example.com/gtav.jpg',
            released: '2013-09-17',
            platforms: [{ platform: { name: 'PC' } }],
            genres: [{ name: 'Action' }],
          },
        ],
      },
    });
    const mockHttp = { get: mockGet } as unknown as AxiosInstance;
    const service = new GamesService(mockHttp);

    const first = await service.searchGames('GTA');
    const second = await service.searchGames('gta');

    expect(first).toHaveLength(1);
    expect(first[0]).toEqual({
      rawgId: 3498,
      title: 'Grand Theft Auto V',
      coverUrl: 'https://img.example.com/gtav.jpg',
      platforms: ['PC'],
      releaseYear: 2013,
      genres: ['Action'],
    });
    expect(second).toEqual(first);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('throws ServiceUnavailableError (503) when RAWG fails during search', async () => {
    const mockGet = jest.fn().mockRejectedValue(new Error('Network Error'));
    const mockHttp = { get: mockGet } as unknown as AxiosInstance;
    const service = new GamesService(mockHttp);

    await expect(service.searchGames('Witcher')).rejects.toThrow(
      ServiceUnavailableError
    );
  });

  it('returns game details by rawgId and caches them', async () => {
    const mockGet = jest.fn().mockResolvedValue({
      data: {
        id: 3328,
        name: 'The Witcher 3: Wild Hunt',
        background_image: 'https://img.example.com/w3.jpg',
        released: '2015-05-18',
        platforms: [
          { platform: { name: 'PC' } },
          { platform: { name: 'PS5' } },
        ],
        genres: [{ name: 'RPG' }],
        description_raw: 'Open world RPG',
        metacritic: 92,
      },
    });
    const mockHttp = { get: mockGet } as unknown as AxiosInstance;
    const service = new GamesService(mockHttp);

    const details = await service.getGameByRawgId(3328);
    const cached = await service.getGameByRawgId(3328);

    expect(details.title).toBe('The Witcher 3: Wild Hunt');
    expect(details.metacritic).toBe(92);
    expect(cached).toEqual(details);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundError (404) when RAWG returns 404 for a game ID', async () => {
    const axios404 = Object.assign(new Error('Not Found'), {
      isAxiosError: true,
      response: { status: 404 },
    });
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    const mockGet = jest.fn().mockRejectedValue(axios404);
    const mockHttp = { get: mockGet } as unknown as AxiosInstance;
    const service = new GamesService(mockHttp);

    await expect(service.getGameByRawgId(999999)).rejects.toThrow(
      NotFoundError
    );
  });
});
