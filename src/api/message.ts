import express from "express";
import prisma from "../db";
import { jwtMiddleWare } from "../middleware/auth";

const router = express.Router();

router.use(jwtMiddleWare);

// отправить сообщение
router.post("/", async (req, res) => {
  const { receiverId, text } = req.body as { receiverId?: number; text?: string };
  if (!receiverId || !text) return res.status(400).json({ message: "receiverId and text required" });

  if (receiverId === req.user!.id) return res.status(400).json({ message: "Cannot send to yourself" });

  const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } });
  if (!receiver) return res.status(404).json({ message: "Receiver not found" });

  const msg = await prisma.message.create({
    data: {
      senderId: req.user!.id,
      receiverId,
      text,
    },
  });

  res.status(201).json(msg);
});

// входящие
router.get("/inbox", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 100);

  const msgs = await prisma.message.findMany({
    where: { receiverId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { sender: { select: { id: true, username: true, email: true } } },
  });

  res.json(msgs);
});

// исходящие
router.get("/sent", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 100);

  const msgs = await prisma.message.findMany({
    where: { senderId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { receiver: { select: { id: true, username: true, email: true } } },
  });

  res.json(msgs);
});

// непрочитанные (кол-во)
router.get("/unread-count", async (req, res) => {
  const count = await prisma.message.count({
    where: { receiverId: req.user!.id, readAt: null },
  });
  res.json({ count });
});

// отметить прочитанным (только получатель)
router.patch("/:id/read", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

  const msg = await prisma.message.findUnique({ where: { id } });
  if (!msg) return res.status(404).json({ message: "Not found" });

  if (msg.receiverId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

  const updated = await prisma.message.update({
    where: { id },
    data: { readAt: msg.readAt ?? new Date() },
  });

  res.json(updated);
});

// удалить (участник сообщения)
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

  const msg = await prisma.message.findUnique({ where: { id } });
  if (!msg) return res.status(404).json({ message: "Not found" });

  const me = req.user!.id;
  if (msg.senderId !== me && msg.receiverId !== me) return res.status(403).json({ message: "Forbidden" });

  await prisma.message.delete({ where: { id } });
  res.status(204).send();
});

export default router;