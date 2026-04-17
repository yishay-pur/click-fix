import { Router } from "express";
import * as employeeController from "../controllers/employeeController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// PUBLIC - Profile browsing endpoints (no user data)
router.get("/search", employeeController.searchEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.get("/", employeeController.getAllEmployees);

// PROTECTED - User data endpoints (requires auth)
router.use(authMiddleware);

router.get("/:id/stats", employeeController.getEmployeeStats);
router.get("/:id/recent-requests", employeeController.getRecentRequests);
router.post("/", employeeController.createEmployee);
router.put("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

export default router;
