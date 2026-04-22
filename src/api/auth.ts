import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db";
import { hashPass, comparePass } from "../utils/hashPass";
import { jwtMiddleWare } from "../middleware/auth";

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

const router = express.Router();

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
  };
}

router.post("/register", async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email, password required" });
    }

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true },
    });

    if (exists) return res.status(409).json({ message: "User already exists" });

    const hashedPass = await hashPass(password);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPass },
      select: { id: true, username: true, email: true, createAt: true },
    });

    return res.status(201).json(user);
  } catch (e) {
    return res.status(500).json({ message: "Register failed" });
  }
});

router.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email, password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await comparePass(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.cookie("access_token", token, cookieOptions());

    return res.json({
      user: { id: user.id, username: user.username, email: user.email, createAt: user.createAt },
    });
  } catch {
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", async (_req, res) => {
  res.clearCookie("access_token", { sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res.json({ ok: true });
});

router.get("/me", jwtMiddleWare, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, username: true, email: true, createAt: true },
  });
  return res.json(me);
});

export default router;