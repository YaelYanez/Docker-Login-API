import express, { Request, Response } from "express";
import cors from "cors";
import ENV from "./env/env.production";
import MongoDBHelper from "./helpers/mongodb.helper";
import { router as AuthRouter } from "./routes/auth.routes";
import colors from "colors";

const app = express();
const mongoDB = MongoDBHelper.getInstance(ENV.MONGODB);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.use("/api/auth", AuthRouter);

app.listen(ENV.API.PORT, async () => {
  console.log(
    colors.green.underline.bold(
      `API running on: ${ENV.API.HOST}:${ENV.API.PORT}`
    )
  );
  await mongoDB.connect();
});

// Handle Errors
process.on("unhandledRejection", async (err: any) => {
  console.log(err);
  mongoDB.close();
  process.exit();
});
