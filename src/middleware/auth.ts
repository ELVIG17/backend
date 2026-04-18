import { NextFunction } from "express";
import { Request, Response, } from "express";
import { Jwt, JwtPayload, Secret } from "jsonwebtoken";
import jwt from "jsonwebtoken"
import { error } from "node:console";
import { appendFile } from "node:fs";

const Jwt_SECRET: Secret = process.env.JWT_SECRET || 'super-secret-key'

interface UserPayLoad {
    id: number;
    email:string;
}

const jwtMiddleWare = (req: Request, res: Response, next: NextFunction ) => {

    const token = req.cookies.accessToken

    if(token === undefined){
        return res.status(401).json({ message: "Unauthorized" })
    }


        try {
            const decoded = jwt.verify(token, Jwt_SECRET) as JwtPayload
            req.user = {id: decoded.id}
            next()

        }

        catch (error){
            console.error("Оибка проверки токенва ", error)
            return res.status(401).json({ message: "Unauthorized: Invalid token" })
            
        }

        next()
    }


 