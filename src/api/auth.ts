import express, { Request, Response } from "express";
import { hashPass } from "../utils/hashPass";
import prisma from "../db";

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

const router = express.Router();

router.post("/login", async function (params) {});
router.post("/logout", async function (params) {});

router.post(
  "/register",
  async function (req: Request<{}, {}, RegisterBody>, res: Response) {
    try {
      const { username, email, password } = req.body;
      if (!email || !password || !username)
        throw new Error("Email or password error1");
      if (email) {
      } // есть ли такой пользователь в бд
      const hashedPass = await hashPass(password);
      const newUser = prisma.user.create({
        data: { username, email, password: hashedPass },
      });
      return res.status(200).json({ text: newUser });
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  },
);

export default router;
