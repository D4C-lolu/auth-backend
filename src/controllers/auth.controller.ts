import { Request, Response } from "express";
import { get } from "lodash";

import { CreateSessionInput } from "../schema/auth.schema";
import {
  signAccessToken,
  signRefreshToken,
  findSessionById,
} from "../services/auth.services";
import { findUserByEmail, findUserById } from "../services/user.services";
import { verifyJwt } from "../utils/jwt";

export async function createSessionHandler(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const message = "Invalid Email or Password";
  const { email, password } = req.body;
  const user = await findUserByEmail(email);

  if (!user) {
    return res.send(message);
  }
  if (!user.verified) {
    return res.send("Please verify your email");
  }
  const isValid = await user.validatePassword(password);
  if (!isValid) {
    return res.send(message);
  }

  //sign access token
  const accessToken = signAccessToken(user);

  //sign refresh token
  const refreshToken = await signRefreshToken({ userId: user._id });
  //send tokens
  return res.send({ accessToken, refreshToken });
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const message = "Could not refresh access token";

  const refreshToken = get(req, "headers.x-refresh");
  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );

  if (!decoded) {
    return res.status(401).send(message);
  }

  const session = await findSessionById(decoded.session);
  if (!session || !session.valid) {
    return res.status(401).send(message);
  }

  const user = await findUserById(String(session.user));

  if (!user) {
    return res.status(401).send(message);
  }

  const accessToken = signAccessToken(user);

  return res.send({ accessToken });
}
