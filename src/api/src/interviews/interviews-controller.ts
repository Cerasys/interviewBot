import axios from "axios";
import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import { Candidate } from "../canidates/candidate-model";
import { HttpError } from "../models/http-error";
import { Interview } from "./interview";
import { Role } from "../roles/role";

// GET all interviews
export const getAllInterviews: RequestHandler = async (req, res, next) => {
  let interviews;
  try {
    interviews = await Interview.find();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, coud not find an interview",
      500
    );
    return next(error);
  }
  res.json({
    interviews: interviews.map((interview) =>
      interview.toObject({ getters: true })
    ),
  });
};

// /api/interviews/
//GET ../:iid
//Retrieve a specific transcript given an id
export const getInterviewById: RequestHandler = async (req, res, next) => {
  const interviewId = req.params.iid;

  let interview;
  try {
    interview = await Interview.findById(interviewId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an interview",
      500
    );
    return next(error);
  }

  if (!interview) {
    const error = new HttpError(
      "Could not find an interview for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ interview: interview });
};

//GET ../candidate/:cid
//Retrieve all transcripts for a given candidate id
export const getInterviewsByCandidateId: RequestHandler = async (req, res, next) => {
  const cid = req.params.cid;
  let interviews;
  try {
    interviews = await Interview.find({ cid: cid }).exec();
    // interviews = interviewList.filter((interview) => interview.cid === cid);
  } catch (err) {
    const error = new HttpError("Could not find an interview", 500);
    return next(error);
  }

  if (!interviews) {
    const error = new HttpError(
      "Could not find interviews for the given candidate id",
      404
    );
    return next(error);
  }
  res.json({ interview: interviews });
};

//GET ../candidate/:cid
//Retrieve all transcripts for a given candidate id
export const getInterviewsByRoleId: RequestHandler = async (req, res, next) => {
  const rid = req.params.rid;
  let interviews;
  try {
    interviews = await Interview.find({ rid: rid }).exec();
    // interviews = interviewList.filter((interview) => interview.cid === cid);
  } catch (err) {
    const error = new HttpError("Could not find an interview", 500);
    return next(error);
  }

  if (!interviews) {
    const error = new HttpError(
      "Could not find interviews for the given role id",
      404
    );
    return next(error);
  }
  res.json({ interview: interviews });
};

export const createInterview: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs. Please check your entered data.", 422)
    );
  }

  const { rid, cid, candidateName, date, score, transcript, aiComplete } =
    req.body;

  const newInterview = new Interview({
    rid,
    cid,
    candidateName,
    date,
    score,
    transcript,
    aiComplete,
  });

  let role;
  try {
    role = await Role.findById(rid);
  } catch (err) {
    const error = new HttpError(
      "An issue occurred while creating an interview, please try again",
      500
    );
    console.log(err);
    return next(error);
  }

  if (!role) {
    const error = new HttpError(
      "Could not find the role for the provided id",
      404
    );
    return next(error);
  }
  console.log(role);

  // TODO: build logic if the candidate id isn"t in the list
  let candidate;
  try {
    candidate = await Candidate.findById(cid);
  } catch (err) {
    const error = new HttpError(
      "An issue occurred while creating the interview, please try again",
      500
    );
    return next(error);
  }

  if (!candidate) {
    const error = new HttpError("Could not find the specified candidate", 404);
    return next(error);
  }

  try {
    // TODO: these should be awaits but cosmo times out
    let session = null;
    session = await mongoose.startSession();
    session.startTransaction();
    newInterview.save({ session });
    role.interviews.push(newInterview.id);
    role.save({ session });
    session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Issue while creating interview, please try again",
      500
    );
    console.log(err);
    return next(error);
  }

  res.status(201).json({ interview: newInterview });
};

/**
 * Creates a meeting bot through recall.ai
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export const createMeetingBot: RequestHandler = async (req, res, next) => {
  const interviewId = req.params.iid;
  const recallToken = process.env.RECALL_APIKEY;

  try {
    await Interview.findById(interviewId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an interview",
      500
    );
    return next(error);
  }

  try {
    await axios({
      method: "post",
      url: "https://api.recall.ai/api/v1/bot/",
      headers: {
        "Authorization": "Token " + recallToken,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: {
        bot_name: "Persona AI",
        real_time_transcription: {
          partial_results: false,
          destination_url: "https://webhook.site/c14f05c4-332e-47b4-8020-94ad69201d6e"//`${process.env.WEBHOOK_HOST}/${interviewId}/updateTranscript`
        },
        transcription_options: {
          provider: "deepgram"
        },
        chat: {
          on_bot_join: {
            send_to: "host",
            message: "Hello from persona"
          }
        },
        automatic_leave: {
          waiting_room_timeout: 1200,
          noone_joined_timeout: 1200,
          everyone_left_timeout: 2
        },
        meeting_url: "https://us06web.zoom.us/j/85286056492?pwd=ZzQ0ZGEwUk52TW5VTGlFSVZXbThBZz09"
      }
    });
  } catch (e) {
    console.log(e);
  }


  res.status(204).end();
};

export const updateTranscript: RequestHandler = async (req, res, next) => {
  const interviewId = req.params.iid;

  let interview;
  try {
    interview = await Interview.findById(interviewId);
  } catch (err) {
    const error = new HttpError(
      "Interview not found",
      404
    );
    return next(error);
  }

  if (!interview) {
    const error = new HttpError(
      "Interview not found",
      404
    );
    return next(error);
  }

  let transcriptPartial = `${req.body.data.speaker}: `;
  req.body.data.words.forEach((word: { text: string }) => {
    transcriptPartial += " " + word.text;
  });

  interview.transcript += transcriptPartial;

  interview.save();

  res.status(204).end();
};

exports.updateTranscript = updateTranscript;
exports.getInterviewById = getInterviewById;
exports.getInterviewsByCandidateId = getInterviewsByCandidateId;
exports.createInterview = createInterview;
exports.getAllInterviews = getAllInterviews;
exports.getInterviewsByRoleId = getInterviewsByRoleId;
exports.createMeetingBot = createMeetingBot;
