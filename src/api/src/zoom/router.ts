import { Router } from "express";
import * as controller from "./controller";
import { getUser, refreshToken, setZoomAuthHeader } from "./middleware";

const router = Router();

router.use(
  "/api",
  getUser,
  refreshToken,
  setZoomAuthHeader,
  controller.proxy
);

export default router;
