import * as dotenv from "dotenv" 
import type { NextFunction , Request , Response} from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
dotenv.config() ;

function authMiddleWare(req :Request,res :Response,next : NextFunction){

    const token : string = req.headers['token'] as string ;

    jwt.verify(token,process.env.JWT_SECRET!,(err : jwt.VerifyErrors | null,payload? : JwtPayload | string) => {
        if(err){
            if(err instanceof jwt.TokenExpiredError){
                // Refresh Token if expired but not essentially required 

                res.status(403).json({
                    message : "Token Expired" ,
                    logout : true
                })
            }
            else{
                res.status(403).json({
                    message : "You are not logged in",
                    logout  : true
                })
                return ; 
            }
        }
        
        if(typeof payload == "string" || typeof payload == "undefined"){
            res.status(403).json({
                message : "incorrect payload",
                logout : true 
            })              
            return ; 
        }
        
        req.headers['userId'] = payload.userId ;
        next() ;
    }) ; 
}

export { authMiddleWare } ; 