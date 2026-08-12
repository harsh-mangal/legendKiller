import express from "express";
import {
  getAmyekaCoinSetting,
  updateAmyekaCoinSetting,
  getMyAmyekaWallet,
} from "../controllers/amyekaCoinController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/setting", getAmyekaCoinSetting);

router.put("/setting", protect, adminOnly, updateAmyekaCoinSetting);

router.get("/wallet", protect, getMyAmyekaWallet);

export default router;