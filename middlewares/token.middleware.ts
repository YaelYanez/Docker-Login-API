import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export default () => ({
  verify: (req: Request, res: Response, next: NextFunction) => {
    // Get Auth Header Value
    const bearerHeader = req.headers["authorization"];

    if (!bearerHeader)
      return res.status(401).json({
        ok: false,
        msg: "You need to be logged in to do that",
      });

    // Get token from array
    const bearerToken = bearerHeader.split(" ")[1];

    // Verify token
    jwt.verify(bearerToken, "secretkeyword", (err: any, tokenDecoded: any) => {
      if (err)
        return res
          .status(403)
          .json({ ok: false, msg: "Sorry! No access.", err });

      req.body.authUser = tokenDecoded;
    });

    next();
  },
});
