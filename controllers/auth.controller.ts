import { Request, Response } from "express";
import MongoDBHelper from "../helpers/mongodb.helper";
import bycript from "bcryptjs";
import ENV from "../env/env.development";
import jwt from "jsonwebtoken";

const mongoDB = MongoDBHelper.getInstance(ENV.MONGODB);

// @desc  Login
// @route POST /api/auth/login
// @access Public
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await mongoDB.db
      .collection("users")
      .findOne({ email: username });

    if (!bycript.compareSync(password, user.password))
      return res
        .status(404)
        .json({ ok: false, msg: "Check username or password" });

    const userValid = {
      uid: user._id,
      email: user.email,
      fullName: user.fullName,
      urlPhoto: user.urlPhoto,
      rol: user.rol,
    };

    jwt.sign(
      userValid,
      "secretkeyword",
      { expiresIn: "120s" },
      (err: any, token) => {
        if (err)
          return res
            .status(500)
            .json({ ok: false, msg: "Something went wrong", err });

        res.status(200).json({
          ok: true,
          msg: "El usuario se autentico con éxito",
          token,
        });
      }
    );
  } catch (err) {
    return res.status(404).json({ ok: false, msg: "Sorry! Not found" });
  }
};

// @desc  Signup
// @route POST /api/auth/signup
// @access Public
export const signup = async (req: Request, res: Response) => {
  const { email, password, fullName, urlPhoto, rol } = req.body;

  try {
    const newUser = {
      email,
      password: bycript.hashSync(password, 10),
      fullName,
      urlPhoto,
      rol,
    };
    const insert = await mongoDB.db.collection("users").insertOne(newUser);

    res
      .status(200)
      .json({ ok: true, msg: "User created", user: insert.insertedId });
  } catch (error) {
    console.log(error);
  }
};
