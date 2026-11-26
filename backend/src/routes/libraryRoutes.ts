import { Router } from 'express';
import {
  addToLibrary,
  deleteLibraryItem,
  getLibrary,
  updateLibraryItem,
} from '../controllers/libraryController';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middleware/validate';
import {
  addLibraryItemSchema,
  idParamSchema,
  libraryQuerySchema,
  updateLibraryItemSchema,
} from '../utils/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', validateQuery(libraryQuerySchema), getLibrary);
router.post('/', validateBody(addLibraryItemSchema), addToLibrary);
router.patch(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateLibraryItemSchema),
  updateLibraryItem
);
router.delete('/:id', validateParams(idParamSchema), deleteLibraryItem);

export default router;
