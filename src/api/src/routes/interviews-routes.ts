import express from "express";
import { check } from "express-validator";
import * as interviewsControllers from "../controllers/interviews-controller";

const router = express.Router();

//GET ../
//Retrieve all interviews
router.get("/", interviewsControllers.getAllInterviews);

//GET ../candidate/:cid
//Retrieve all transcripts for a given candidate id
router.get(
  "/candidates/:cid",
  interviewsControllers.getInterviewsByCandidateId
);

//GET ../candidate/:cid
//Retrieve all transcripts for a given candidate id
router.get("/roles/:rid", interviewsControllers.getInterviewsByRoleId);

// /api/interviews/
//GET ../:iid
//Retrieve a specific transcript given an id
router.get("/:iid", interviewsControllers.getInterviewById);

router.post(
  "/",
  [
    check("rid").not().isEmpty(),
    check("cid").not().isEmpty(),
    check("candidateName").not().isEmpty(),
    check("score").not().isEmpty(),
    check("transcript").not().isEmpty(),
    check("aiComplete").not().isEmpty(),
  ],
  interviewsControllers.createInterview
);

router.post(
  "/:iid/start",
  interviewsControllers.createMeetingBot
);

router.post(
  "/:iid/updateTranscript",
  interviewsControllers.updateTranscript
);

export default router;
