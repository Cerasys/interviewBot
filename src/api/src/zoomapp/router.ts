import { Router } from "express";
import * as controller from "./controller";

const router = Router();

router
  .use("/proxy", controller.proxy)
  .use("/sockjs-node", controller.proxy)
  .get("/install", controller.install)
  .get("/auth", controller.auth)
  .get("/home", controller.home)
  .get("/authorize", controller.inClientAuthorize)
  .post("/onauthorized", controller.inClientOnAuthorized);

export default router;