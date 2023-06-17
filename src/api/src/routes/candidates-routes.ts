import express from "express";
import { check } from "express-validator";
import * as CandidatesControllers from "../controllers/candidates-controller";

const router = express.Router();

// GET all candidates
router.get("/", CandidatesControllers.getAllCandidates);

// GET ../candidate/:cid
// Retrieve candidate information given a specific candidate id (cid)
// # POST, PATCH, and DELETE are not relevant
router.get("/:cid", CandidatesControllers.getCandidateById);

// POST candidate
router.post(
  "/",
  [check("name").not().isEmpty(), check("email").normalizeEmail().isEmail()],
  CandidatesControllers.createCandidate
);

export default router;
