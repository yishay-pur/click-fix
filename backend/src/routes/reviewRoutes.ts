import { Router } from "express";
import * as reviewController from "../controllers/reviewController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// PUBLIC - Review browsing (no user data)
router.get("/", reviewController.getAllReviews);
router.get("/:id", reviewController.getReviewById);

// PROTECTED - Review management (requires auth)
router.use(authMiddleware);

router.post("/", reviewController.createReview);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

export default router;
