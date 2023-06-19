import express from "express";
import { check } from "express-validator";
import * as rolesControllers from "./roles-controller";

const router = express.Router();

// GET all roles
router.get("/", rolesControllers.getAllRoles);

// GET ../:rid
// Retrieve list of all candidates for a given role id (rid)
router.get("/:rid", rolesControllers.getRoleById);

// POST role
router.post("/", [check("name").not().isEmpty()], rolesControllers.createRole);

export default router;
