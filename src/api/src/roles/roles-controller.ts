import { validationResult } from "express-validator";
import { HttpError } from "../models/http-error";
import { Role } from "./role";
import { RequestHandler } from "express";

// const roleList = [
//   {
//     name: "Hiring Manager",
//     rid: "01",
//     interviews: ["01", "02"],
//   },
//   {
//     name: "Dev Ops",
//     rid: "02",
//     interviews: ["03"],
//   },
// ];

// const candidates = [
//   {
//     name: "Alex Smith",
//     email: "email@email.com",
//     cid: "01",
//   },
//   {
//     name: "Billy Really long name",
//     email: "email2@email.com",
//     cid: "02",
//   },
//   {
//     name: "Tester Jones",
//     email: "email3@email.com",
//     cid: "03",
//   },
// ];

export const getRoleById: RequestHandler = async (req, res, next) => {
  const roleId = req.params.rid;
  console.log(roleId);
  let role;
  try {
    role = await Role.findById(roleId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a role",
      500
    );
    return next(error);
  }

  if (!role) {
    const error = new HttpError(
      "Could not find a role for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ role: role.toObject({ getters: true }) });
};

export const getAllRoles: RequestHandler = async (req, res, next) => {
  let roles;
  try {
    roles = await Role.find();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, coud not find a role",
      500
    );
    return next(error);
  }
  res.json({
    roles: roles.map((role) => role.toObject({ getters: true })),
  });
};

export const createRole: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs. Please check your entered data.", 422)
    );
  }
  const { name } = req.body;

  const newRole = new Role({
    name,
    interviews: [],
  });
  console.log(newRole);

  try {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    // await newRole.save({ session });
    // session.commitTransaction();
    newRole.save((err, savedRole) => {
      console.log(JSON.stringify(savedRole));
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Issue while creating role, please try again",
      500
    );
    return next(error);
  }

  res.status(201).json({ role: newRole });
};

exports.getRoleById = getRoleById;
exports.getAllRoles = getAllRoles;
exports.createRole = createRole;
