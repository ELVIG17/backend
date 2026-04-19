  import express, { Request, Response } from "express";
  import { comparePass, hashPass } from "../utils/hashPass";
  import prisma from "../db";
  import bcrypt from "bcrypt";
  import jwt from "jsonwebtoken"
  import { JsonWebTokenError } from "jsonwebtoken";

  interface LoginBody {
    username?: string;
    email?: string;
    password?: string;

  }

  interface RegisterBody {
    username?: string;
    email?: string;
    password?: string;
  }

  const router = express.Router();

  router.post("/login", async function (req: Request<{}, {}, LoginBody>, res: Response) {
    
    try{

      const { username, email, password } = req.body;

      const userOfFind = await prisma.user.findFirst({where: {email}})

      if(!userOfFind || (!(await  comparePass(password || '', userOfFind.password)))){
        return res.status(401).json({message: 'invalit password or email'})

      }
      const accessToken = jwt.sign({userId: userOfFind.id}, process.env.JWT_SECRET || "default_secret_key", {expiresIn: "3d"})

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      })

      res.json({userId:userOfFind.id, username: userOfFind.username, email: userOfFind.email  })
    }
    catch (e:any){
        return res.status(501).json({error:e.message})
    }
  });
  router.post("/logout", async function (params) {});

  router.post(
  "/register",
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    try {
      const { username, email, password } = req.body;

      if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({ message: "Email/username/password required" });
      }

      const makedUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (makedUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPass = await hashPass(password); 
      const newUser = await prisma.user.create({
        data: { username, email, password: hashedPass },
        select: { id: true, username: true, email: true },
      });

      return res.status(201).json(newUser);
    } catch (e) {
      return res.status(400).json({
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }
);

  export default router;
