import { Router } from 'express';
import { getReviewsByProduct, addReview, deleteReview } from '../controllers/reviewController.js';
import { authenticate } from '../src/middlewares/auth.js';

const router = Router();

router.get('/:productId',    authenticate, getReviewsByProduct);
router.post('/:productId',   authenticate, addReview);
router.delete('/:id',        authenticate, deleteReview);

export default router;
