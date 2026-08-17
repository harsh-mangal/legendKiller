import express from "express";
import { getDynamicSitemap, getRobotsTxt } from "../controllers/sitemapController.js";

const router = express.Router();

router.get("/sitemap.xml", getDynamicSitemap);
router.get("/robots.txt", getRobotsTxt);

export default router;
