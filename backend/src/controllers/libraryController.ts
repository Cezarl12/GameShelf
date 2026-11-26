import { NextFunction, Response } from 'express';
import { libraryService } from '../services';
import { AuthenticatedRequest, LibraryQuery } from '../types';

export async function getLibrary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const query: LibraryQuery = {
      status: req.query.status as LibraryQuery['status'],
      platform: req.query.platform as string | undefined,
      sort: req.query.sort as LibraryQuery['sort'],
      order: req.query.order as LibraryQuery['order'],
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    };
    const result = await libraryService.getLibrary(userId, query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function addToLibrary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { rawgId, status } = req.body;
    const item = await libraryService.addGame(userId, rawgId, status);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateLibraryItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = String(req.params.id);
    const updated = await libraryService.updateGame(userId, id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteLibraryItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = String(req.params.id);
    await libraryService.deleteGame(userId, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
