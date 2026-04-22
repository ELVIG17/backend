export type Post = {
  id: number;
  title: string;
  content?: string | null;
  createdAt: string;
  updatedAt?: string; // если есть в бэке
  authorId: number;
  author?: { id: number; username: string; email?: string };
};