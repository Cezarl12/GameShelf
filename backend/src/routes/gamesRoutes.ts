import { Router } from 'express';
import { getGameDetails, searchGames } from '../controllers/gamesController';
import { validateParams, validateQuery } from '../middleware/validate';
import { gamesSearchQuerySchema, rawgIdParamSchema } from '../utils/validation';

const router = Router();

router.get('/search', validateQuery(gamesSearchQuerySchema), searchGames);
router.get('/:rawgId', validateParams(rawgIdParamSchema), getGameDetails);

export default router;
