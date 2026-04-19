import express, {Request, Response} from "express";
import prisma from "../db"
import { jwtMiddleWare } from "../middleware/auth";

const router = express.Router()

interface CreatePostBody {

    title?: string, 
    content?: string, // описывает тела запросов для пост запросов 
}

interface UpdatePostBody {
    title?: string, 
    content?: string, // описывает тела запросов для обновленрий
}


function parseId (idRaw: string): number | null {
    const id = Number(idRaw);
    return Number.isInteger(id) && id > 0 ? id : null
}  // проверка на целочисленность отрицательность и строчность 


router.get('/',  async (req: Request, res: Response) => {
    const posts = await prisma.post.findMany({
        orderBy: {createdAt: "desc"},
        select: {
            id: true,
            title: true,
            content: true, 
            createdAt: true, 
            updatedAt: true, 
            authorId: true, 
            author: {select: {id: true , username: true, email: true,}}
        }

    }
    

)
return res.json(posts)
}
)


router.get('/:id',  async (req: Request<{ id: string }>, res: Response) => {


    const id = parseId(req.params.id) //. беру айди из урла

    if(!id) {return res.status(400).json({message: "invalid Id"})} //  проверяю айди 



    const post = await prisma.post.findUnique({
        where: {id},
        select: {
            id: true,
            title: true,
            content: true, 
            createdAt: true, 
            updatedAt: true, 
            authorId: true, 
            author: {select: {id: true , username: true, email: true,}}
        }

    }

    

    )

    if(!post){return res.status(404).json({message: "post not found"})}


return res.json(post)
}
)


router.post("/", jwtMiddleWare, async (req: Request<{}, {}, CreatePostBody>, res: Response) => {

    const {title, content} = req.body

    if (typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({message: "title invalid"})
    }
  // тайтл должен нбыть не пустым и строкой

      if (content !== undefined && typeof content !== "string") {
    return res.status(400).json({ message: "content must be a string" });
  } // если контент прислали то он должен быть строкой

    const post = await prisma.post.create({
    data: {
      title: title.trim(),
      content: content?.trim(),
      authorId: req.user!.id,
    },
        select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
    },
  });

  return res.status(201).json(post);

})


router.patch("/:id", jwtMiddleWare, async (req: Request<{id: string}, {}, UpdatePostBody>, res:Response) => {

    const id = parseId(req.params.id)

     if (!id) return res.status(400).json({ message: "Invalid id" });


     const {title, content} = req.body

     if(title !== undefined && typeof title !== "string") {
        return res.status(400).json({ message: "title must be a string" });
     }

     if (content !== undefined && typeof content !== "string") {
      return res.status(400).json({ message: "content must be a string" });
    }

        if (title === undefined && content === undefined) {
      return res.status(400).json({ message: "Nothing to update" });
    }

        const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

        if (!existing) return res.status(404).json({ message: "Post not found" });


            if (existing.authorId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }   

    const updated = await prisma.post.update({
        where: {id},
        data: {
            ...(title !== undefined ? {title: title.trim()}:{}),
            ...(content !== undefined ? { content: content.trim() } : {}),
        },
        select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            authorId: true,

        }
    })
    return res.json(updated);
})

router.delete("/:id", jwtMiddleWare, async (req: Request<{ id: string }>, res: Response) => {
    const id = parseId(req.params.id)

    if (!id) return res.status(400).json({ message: "Invalid id" });


      const existing = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });

  if (!existing) return res.status(404).json({ message: "Post not found" });
  if (existing.authorId !== req.user!.id) {
    return res.status(403).json({ message: "Forbidden" });
  }


    await prisma.post.delete({ where: { id } });


      return res.status(200).json({ message: "Deleted" });
});



export default router;




