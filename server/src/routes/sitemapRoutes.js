import express from "express";
import { getDynamicSitemap } from "../controllers/sitemapController.js";

const router = express.Router();

router.get("/sitemap.xml", getDynamicSitemap);

export default router;
