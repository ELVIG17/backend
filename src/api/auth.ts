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

      const makedUser = await prisma.user.findFirst({where: {OR:[{email}, {username}]}})

         if(makedUser){
        return res.status(400).json({message: "User already exists"})
      }
      
      const hashedPass = await hashPass(password);
      const newUser = await prisma.user.create({
        data: { username, email, password: hashedPass },
        select: {
          id: true,
          username: true, 
          email: true,  
        }
      });
      return res.status(201).json(newUser);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  },
);

export default router;
