import { Router } from "express";
import * as categoryController from "../controllers/categoryController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// PUBLIC - Category browsing (no user data)
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// PROTECTED - Category management (requires auth)
router.use(authMiddleware);

router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
