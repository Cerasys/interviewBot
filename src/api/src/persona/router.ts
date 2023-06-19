console.log("inside of ther psona router?");
import { Router } from "express";
console.log("loading controller");
import controller from "./controller";
console.log("controller loaded");

const router = Router();

router.post("/connect", controller.connectToPersona);

router.get("/hello", controller.hello);

export default router;