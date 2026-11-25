import { NextFunction, Response } from 'express';
import { profileService } from '../services';
import { AuthenticatedRequest } from '../types';

export async function getProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await profileService.getProfile(req.user!.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const updated = await profileService.updateProfile(
      req.user!.userId,
      req.body
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function getProfileStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await profileService.getStats(req.user!.userId);
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await profileService.deleteAccount(req.user!.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
