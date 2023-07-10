console.log("inside of ther psona router?");
import { Router } from "express";
console.log("loading controller");
import controller from "./controller";
import { middleware } from "../middleware/middleware";
console.log("controller loaded");

const router = Router();

router.post("/connect", middleware.requiresThirdPartyAuth, controller.connectToPersona);
router.post("/:pid/update", controller.updatePersona);
router.post("/webhook", controller.personaBotStatusChange);

router.get("/hello", controller.hello);

export default router;