import { Router } from "express";
import dashboardController from "../controllers/dashboard.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.options("/stats", (req, res) => res.sendStatus(204));

router.get(
  "/stats",
  authenticate,
  (req, res) => dashboardController.stats(req, res)
);

export default router;
