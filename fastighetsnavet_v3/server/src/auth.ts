import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export type AuthUser = { id:string; namn:string; roll:"admin"|"tekniker" };

export function signToken(user: AuthUser) {
  return jwt.sign(user, SECRET, { expiresIn: "8h" });
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message:"Du måste logga in." });
  try {
    (req as Request & {user:AuthUser}).user = jwt.verify(header.slice(7), SECRET) as AuthUser;
    next();
  } catch {
    res.status(401).json({ message:"Ogiltig eller utgången session." });
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as Request & {user:AuthUser}).user;
  if (user.roll !== "admin") return res.status(403).json({ message:"Endast administratörer har behörighet." });
  next();
}
