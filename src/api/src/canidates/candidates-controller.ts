import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { Candidate } from "./candidate-model";
import { HttpError } from "../models/http-error";

export const getCandidateById: RequestHandler = async (req, res, next) => {
  const candidateId = req.params.cid;

  let candidate;
  try {
    candidate = await Candidate.findById(candidateId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a candidate",
      500
    );
    return next(error);
  }

  if (!candidate) {
    const error = new HttpError(
      "Could not find the candidate for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ candidate: candidate.toObject({ getters: true }) });
};

export const getAllCandidates: RequestHandler = async (req, res, next) => {
  let candidates;
  try {
    candidates = await Candidate.find();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, coud not find a candidate",
      500
    );
    return next(error);
  }
  res.json({
    candidates: candidates.map((candidate) =>
      candidate.toObject({ getters: true })
    ),
  });
};

export const createCandidate: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs. Please check your entered data.", 422)
    );
  }
  const { name, email } = req.body;

  const newCandidate = new Candidate({
    name,
    email,
  });
  console.log(newCandidate);

  try {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    // await newRole.save({ session });
    // session.commitTransaction();
    newCandidate.save((err, savedCandidate) => {
      console.log(JSON.stringify(savedCandidate));
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Issue while creating candidate, please try again",
      500
    );
    return next(error);
  }

  res.status(201).json({ candidate: newCandidate });
};
