import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import bycript from "bcryptjs";
import ENV from "./env/env.production";
import AuthToken from "./middlewares/token.middleware";
import MongoDBHelper from "./helpers/mongodb.helper";

const app = express();
const token = AuthToken();
const mongoDB = MongoDBHelper.getInstance(ENV.MONGODB);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware for CORS
app.use(cors({ origin: true, credentials: true }));

app.post("/api/auth/login", async (req: Request, res: Response) => {
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
});

app.get(
  "/api/auth/getCustomers",
  token.verify,
  (req: Request, res: Response) => {
    const { authUser } = req.body;
    const mockUser = { id: 1, name: "yael" };

    res.status(200).json({ ok: true, authUser, mockUser });
  }
);

app.post("/api/auth/create", async (req: Request, res: Response) => {
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
});

app.listen(ENV.API.PORT, async () => {
  console.log(`Server runnning on port: ${ENV.API.PORT}`);
  try {
    await mongoDB.connect();
  } catch (error) {
    console.log(error);
  }
});

// Handle Errors
process.on("unhandledRejection", async (err: any) => {
  console.log(err);
  mongoDB.close();
  process.exit();
});
