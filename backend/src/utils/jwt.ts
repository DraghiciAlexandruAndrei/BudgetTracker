
import jwt, {
  type JwtPayload,
  type SignOptions
} from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
}

/**
 * Retrieves the JWT secret from environment variables.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 64) {
    throw new Error(
      "JWT_SECRET is missing or too short. Check backend/.env"
    );
  }

  return secret;
}

/**
 * Generates an access token for an authenticated user.
 */
export function signAccessToken(userId: string): string {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "1h";

  return jwt.sign(
    { sub: userId },
    getJwtSecret(),
    {
      expiresIn: expiresIn as SignOptions["expiresIn"],
      algorithm: "HS256"
    }
  );
}

/**
 * Verifies an access token and returns its payload.
 */
export function verifyAccessToken(
  token: string
): AccessTokenPayload {
  const decoded = jwt.verify(
    token,
    getJwtSecret(),
    {
      algorithms: ["HS256"]
    }
  );

  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string"
  ) {
    throw new Error("Invalid access token payload.");
  }

  return decoded as AccessTokenPayload;
}
