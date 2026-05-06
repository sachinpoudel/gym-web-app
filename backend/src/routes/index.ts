import { Router } from "express";
import authRoutes from "./auth.routes";
import memberRoutes from "./member.routes";
import paymentRoutes from "./payment.routes";
import reportsRoutes from "./reports.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Gym API is running"
  });
});

router.use("/auth", authRoutes);
router.use("/members", memberRoutes);
router.use("/payments", paymentRoutes);
router.use("/reports", reportsRoutes);

export default router;
