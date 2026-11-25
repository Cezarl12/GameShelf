import { NextFunction, Request, Response } from 'express';
import { gamesService } from '../services';

export async function searchGames(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const q = String(req.query.q ?? '');
    const results = await gamesService.searchGames(q);
    res.status(200).json({ results });
  } catch (err) {
    next(err);
  }
}

export async function getGameDetails(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawgId = Number(req.params.rawgId);
    const game = await gamesService.getGameByRawgId(rawgId);
    res.status(200).json(game);
  } catch (err) {
    next(err);
  }
}
