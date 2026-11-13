
import type { RequestHandler } from "express";

import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate: RequestHandler = (
  request,
  response,
  next
) => {
  const authorization = request.get("Authorization");

  // Check whether the Authorization header exists
  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({
      success: false,
      message: "Authentication required."
    });
    return;
  }

  // Extract the token
  const token = authorization.slice(7).trim();

  if (!token) {
    response.status(401).json({
      success: false,
      message: "Access token is missing."
    });
    return;
  }

  // Verify JWT
  try {
    const payload = verifyAccessToken(token);

    request.auth = {
      userId: payload.sub
    };
  } catch {
    response.status(401).json({
      success: false,
      message: "Invalid or expired access token."
    });
    return;
  }

  next();
};
