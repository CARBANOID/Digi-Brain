import * as dotenv from "dotenv" 
import type { NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
dotenv.config() ;

// Overide the types of the Express to pass the data from middelware

// Method 1 
function authMiddleWare(req :any,res :any,next : NextFunction){
    const token : string = req.headers.token ;
    jwt.verify(token,process.env.JWT_SECRET!,(err,payload : any) => {
        if(err){
            res.status(403).json({
                message : "You are not logged in"
            })
            return ; 
        }
        req.headers.userId = payload.userId ; 
        next() ;
    }) ; 
}

/*
// Method 2 
function authMiddleWare(req :Request,res :Response,next: NextFunction){
    const token : any = req.headers['token'] ;
    try{
        const tokenPayload : JwtPayload | string = jwt.verify(token,process.env.JWT_SECRET!) ; 
        if(typeof tokenPayload == "string"){
          res.status(403).json({
                message : "Wrong Payload"
            })
            return ; 
        }
        req.headers['userId'] = (tokenPayload as JwtPayload).userId ; 
        next() ;
    }
    catch(e){
        res.status(403).json({
            message : "You are not logged in"
        })
        return ; 
    }
}
*/


export { authMiddleWare } ; 