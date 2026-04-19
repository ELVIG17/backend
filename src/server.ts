import express, { type Request, type Response } from "express";
import cors from "cors";
import postsRouter from "./api/posts"
// import { pool } from "./db";

import authRouter from "./api/auth";
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(cookieParser())

app.use("/api/auth", authRouter);

app.use("/posts", postsRouter);



app.get("/", (req, res) => {
  res.status(200).json({ status: "ok!!!!!!" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});