import express from "express"  ;
import mongoose from "mongoose";
import jwt from "jsonwebtoken" ; 
import zod from "zod" ;
import bcrypt from "bcrypt" ; 
import cors from "cors" ;
import axios from "axios";
import type { StringValue } from "ms";

import { UserCollection , TagCollection , LinkCollection , ContentCollection, FolderCollection, FileCollection, QueryCollection } from './db.js'  ;
import { authMiddleWare } from './auth.js'
import { createVectorSearchIndex, getEmbedding, runQueryVectorSearch } from "./vectorSearch.js";

import * as cheerio from 'cheerio'
import * as dotenv from 'dotenv' ;
dotenv.config() ;

const saltRounds : number = 7 ; 
const app = express() ; 
app.use(express.json()) ;
app.use(cors()) ;

const zodUserSchema = zod.strictObject({
    username : zod.string().min(3).max(20) ,
    password : zod.string().min(8).max(20)
   .refine((password) => /[A-Z]/.test(password) , {message : "password should have atleast 1 uppercase letter"})    
   .refine((password) => /[a-z]/.test(password) , {message : "password should have atleast 1 lowercase letter"})
   .refine((password) => /[0-9]/.test(password) , {message : "password should have atleast 1 digit "})
   .refine((password) => /[!@#$%^&*]/.test(password) , {message : "password should have atleast 1 specialcase letter"})
}); 

/*
To create a Type out of an array as const or Tuple 
const colors = ["red", "green", "blue"] as const;
type Color = typeof colors[number]; 

as const: This assertion tells TypeScript to treat the array as a tuple with literal types for its elements,
rather than just an array of string. Without as const, typeof contentKind[number] would simply result in string.

[number]: This is an indexed access type. It extracts the type of all possible numeric indices within the array. 
In the case of a tuple with literal types, this results in a union type of all the literal values within the tuple.
*/

const contentArr = ["Document","Tweet","Youtube"] as const ;

const zodContentSchema = zod.strictObject({
    link        : zod.string() ,
    type        : zod.literal(contentArr) , 
    title       : zod.string() ,
    description : zod.string().optional() ,
    tags        : zod.array(zod.string())
})

type userType = zod.infer<typeof zodUserSchema>  ; 
type contentType = zod.infer<typeof zodContentSchema> ; 

interface payloadType {
    userId : mongoose.Types.ObjectId
}

app.post("/api/v1/signup", async(req,res) => {
    const {success,error} = await zodUserSchema.safeParseAsync(req.body) ; 
    if(!success){   
        res.status(411).json({
            // message : "Error in inputs !!" ,
            error : error.message 
        })    
        return ; 
    }

    const user : userType = req.body ; 
    const userFound = await UserCollection.findOne({
        username : user.username 
    }) ;

    if(userFound){
        res.status(403).json({
            error : "username already taken! "
        })    
        return ;
    }

    const saltedPassword = await bcrypt.hash(user.password,saltRounds) ; 
    UserCollection.create({
        username : user.username , 
        password : saltedPassword 
    }) ; 
    res.status(200).json({
        message : "Sign up Successful"
    }) 
}) 

app.post("/api/v1/signin", async(req,res) => {
    const {success,error} = await zodUserSchema.safeParseAsync(req.body) ; 
    if(!success){
        res.status(411).json({
            // message : "error in inputs !!" ,
            error : error.message 
        })    
        return ; 
    }

    const user : userType = req.body ; 
    const userFound  = await UserCollection.findOne({
        username : user.username 
    }) ;

    if(!userFound){
        res.status(404).json({
            error : "You are not Signed up!!"
        })    
        return ;
    }
    
    const correctPassword : boolean = await bcrypt.compare(user.password,userFound.password) ;

    if(!correctPassword){
        res.status(403).json({
            error : "Wrong username or password"
        }) 
        return ;
    }

    const payload : payloadType = { userId :userFound._id } ;
    const token : string = jwt.sign(payload,process.env.JWT_SECRET!,
    {
        expiresIn : (process.env.JWT_EXPIRE_TIME as StringValue) || '4h'
    }
) ; 

    res.header('token',token) ; 
    res.status(200).json({
        message : "Sign in Successful",
        token   : token 
    }) 
}) ;


// To get the contents of the user
app.get("/api/v1/content", authMiddleWare , async(req,res) => {
    const userId = req.headers.userId ;
    const FileId = req.headers.fileid ;
    // const userId = req.headers.userId ;

    if(FileId){
        const File = await FileCollection.findOne({
            _id : FileId ,
        }).populate("contents") ;

        res.status(200).json({
            userContent : { 
                FileName  : File!.fileName ,
                contents  : File!.contents 
            }
        }) ;
        return ;
    }

    // populate(userId,"username") method to get the username of the user having that userId from UserCollection also 
    // populate(reference,feilds) // Example : populate(reference,"feildA feildB ... feildN") // populate("userId","username password") ;
    // populate(reference,"feildA -id") -> excludes the _id feild 
    // populate(userId) provide all the field of the user  having that userId from UserCollection also 

    const userContent = await ContentCollection.find( {
        userId : userId 
    } ).populate("userId","username  -_id").populate("tags","title -_id") ;

    res.status(200).json({ 
        userContent : userContent 
    }) 
}) ;

const getOEmbed = async(url : string ,ContentType : string) : Promise<string> => {
    let TextToEmbed : string = ""
    if(ContentType == "Youtube"){
        const result = await axios.get(`https://www.youtube.com/oembed?url=${url}&format=json`) ; 
        const data   = result.data ; 
        TextToEmbed += (data.title ?? "") + " : " + (data.author_name ?? "")
        
    }
    else if(ContentType == "Tweet"){
        const result    = await axios.get(`https://publish.twitter.com/oembed?url=${url}`);
        const data      = result.data ;
        const html      = data.html ; 
        const $         = cheerio.load(html) ;  // html parser
        const tweetText = $("p").text() ; 
        TextToEmbed    += (data.title ?? "") + " : " + (data.author_name ?? "") + " : " + tweetText ;
    }
    return TextToEmbed ; 
}

// To add the content in the File or Home 
app.post("/api/v1/content", authMiddleWare , async(req,res) => {
    const { success , error } = await zodContentSchema.safeParseAsync(req.body) ;
    const FileId = req.headers.fileid ; 

    if(!success){
        res.status(411).json({
            message : "Error in inputs !!" ,
            inputError : error.message 
        })    
        return ; 
    }

    const content : contentType = req.body ; 

    // if Promise.all is not used than an array of promise instead of array of tag references is returned 
    // all promises get paralley resolved now 
    const tagRefs = await Promise.all(content.tags.map(async(tagTitle : string) => {
        const tagFound = await TagCollection.findOne( { title : tagTitle } ) ; 
        if(tagFound) return tagFound._id ; 

        const tagCreated = await TagCollection.create( { title : tagTitle} ) ; 
        return tagCreated._id ;
    })) ;

    const TextToEmbed      : string   = await getOEmbed(content.link,content.type) ; ;
    const contentEmbedding : number[] = await getEmbedding(content.type + " : " + content.title + " " + content.description + " : " + TextToEmbed) as number[];
    
    const contentAdded = await ContentCollection.create({
        link         : content.link ,
        type         : content.type , 
        title        : content.title ,
        description  : (content.description ? content.description : "") ,
        tags         : tagRefs,
        userId       : req.headers.userId , 
        embedding    : contentEmbedding
    }) ;  

    if(FileId){
        await FileCollection.updateOne({
            _id : FileId,
        },
        {
            $push : {contents : contentAdded._id}
        })
    }

    res.status(200).json({
        message : "Content created successfully"
    }) 
}) ;

// To delete the content
app.delete("/api/v1/content", authMiddleWare ,async(req,res) => {
    const contentId = req.headers.contentid ;
    const userId    = req.headers.userId ;
    const FileId    = req.headers.fileid ;

    if(FileId){
        await FileCollection.updateOne(
            { _id   : FileId },
            { $pull : {contents : contentId } }
        )  // $pull removes the specified element and $pop removes the last/first element
    }

    // since content titles are unique
    const contentPresent = await ContentCollection.findOneAndDelete({
        _id    : contentId ,
        userId : userId
    }) ;  

    if(!contentPresent){
        res.status(403).json({
            message : "You don't have a content with this title"
        }) 
        return ;
    }

    res.status(200).json({
        message : "Content deleted successfully"
    }) 
}) ;


app.post("/api/v1/brain/share", authMiddleWare , async(req,res) => {
    const canShare : boolean = req.body.share ;

    if(!canShare){  // deleting the user existing link
        const linkFound = await LinkCollection.findOneAndDelete( { userId : req.headers.userId } ) ;
        if(linkFound){
            res.status(200).json({
            message : "Link Deleted"
            })  
            return ; 
        }

        res.status(401).json({
        message : "Link Not Found"
        })  
        return ; 
    }


    const UserFound = await LinkCollection.findOne({
        userId : req.headers.userId 
    })

    if(UserFound){
        try{
            jwt.verify(UserFound.hash,process.env.JWT_SHARE_SECRET!) ;
            res.status(200).json({
                link    : UserFound.hash ,
                message : "link already present"
            }) 
            return ;
        }
        catch(e){
            // Link / Token Expired Error
        }
    }
 
    const encryptedUserId : string = jwt.sign({userId : req.headers.userId!},process.env.JWT_SHARE_SECRET!,
        {
           expiresIn : (process.env.JWT_EXPIRE_TIME as StringValue) || '4h' 
        }
    ) ;


    if(UserFound){
        await LinkCollection.updateOne({
            userId : req.headers.userId 
        },
        {
            hash : encryptedUserId ,
        }) 
    }
    else {
        await LinkCollection.create({
            hash : encryptedUserId ,
            userId : req.headers.userId 
        }) 
    }

    res.status(200).json({
        link : encryptedUserId ,
        message : "link created succesfully"
    }) 
}) ;


app.get("/api/v1/brain/:shareLink", async (req,res) => {
    const shareLink : string = req.params.shareLink ;

    jwt.verify(shareLink,process.env.JWT_SHARE_SECRET!,async(err,payload : any) => {
        if(err){
          res.status(403).json({
            message : "The link is not valid"
          }) 
          return ;
        }

        const userId = payload.userId ;
        const userLink = await LinkCollection.findOne( { hash : shareLink , userId : userId } )

        if(!userLink){
          res.status(404).json({
            message : "Page Not Found"
          }) 
          return ;
        }

        const userContent = await ContentCollection.find( {
            userId : userId 
        }).populate("userId","username -_id").populate("tags","title -_id") ;

        res.status(200).json({
            userContent : userContent 
        })
    })
}) ;


// get folder data
app.get("/api/v1/folder",authMiddleWare,async(req,res) => {
    const FolderId = req.headers.folderid ;
    const userId   = req.headers.userId ;

    if(!FolderId){ // FolderId -> 
        const FoldersAndFiles = await FolderCollection.find({
                parentFolderId : FolderId ,
                userId         : userId 
        })
        res.status(200).json({FoldersAndFiles}) ;
        return ;
    }

    const FoldersAndFiles = await FolderCollection.findOne({
        _id    : FolderId ,
        userId : userId 
    })

    res.status(200).json({FoldersAndFiles}) ;
})


// create Folder or File
app.post("/api/v1/FolderFile",authMiddleWare,async(req,res) => {
    const userId         = req.headers.userId ;
    const FolderName     = req.body.foldername ;
    const FileName       = req.body.filename ;
    const parentfolderId = req.body.parentfolderid ; 

    try{
        if(FolderName){
            const childFolder = await FolderCollection.create({
                folderName     : FolderName ,
                childFiles     : [] ,
                childFolders   : [] ,
                userId         : userId ,
                parentFolderId : parentfolderId ?? null
            }) ;

            if(parentfolderId){
                await FolderCollection.updateOne({
                    _id   : parentfolderId
                },{ $push : {childFolders : childFolder._id} })
            }
        }
        else if(FileName){
            const childFile = await FileCollection.create({
                fileName : FileName ,
                contents : []
            }) ;

            if(parentfolderId){
                await FolderCollection.updateOne({
                    _id   : parentfolderId
                },{ $push : {childFiles : childFile._id} })
            }
        }
    }
    catch(e){
        res.status(400).json({
            message : e 
        })   
    }

    res.status(200).json({
        message : "Folder/File Added Successfully"
    })
})

const RDeleteFolderChilds = async(FolderId : any,FileId : any) =>{  // R -> Recursive
    if(FolderId){
        const Folder = await FolderCollection.findOne({ _id : FolderId }) ; 

        // Recursively Delete Child Folders and Files 
        if(Folder!.childFolders.length) Folder!.childFolders.forEach( async(childFolderId : any) => await RDeleteFolderChilds(childFolderId,undefined)) ;
        if(Folder!.childFiles.length)   Folder!.childFiles.forEach( async(childFileId : any) => await RDeleteFolderChilds(undefined,childFileId)) ; 

        await FolderCollection.deleteOne({ _id : FolderId }) ;
    }
    else if(FileId){
        const File = await FileCollection.findOne({ _id : FileId }) ; 
        // Delete File content Also
        if(File!.contents.length) await ContentCollection.deleteMany( { _id : { $in : File!.contents} }) ; // $in filter checks if the specific property is present in the collection document
        await FileCollection.deleteOne({ _id : FileId }) ;
    }
}

app.delete("/api/v1/FolderFile",authMiddleWare,async(req,res) => {
    const ParentFolderId = req.headers.parentfolderid ;
    const FolderId       = req.headers.folderid ;
    const FileId         = req.headers.fileid ;
    const userId         = req.headers.userId ;

    try{
        if(FolderId){
            if(ParentFolderId){
                await FolderCollection.updateOne({
                    _id    : ParentFolderId,
                    userId : userId
                },{ $pull  : {childFolders : FolderId} })
            }
        }
        else if(FileId){
            if(ParentFolderId){
                await FolderCollection.updateOne({
                    _id    : ParentFolderId ,
                    userId : userId
                },{ $pull  : {childFiles : FileId} })
            }
        }
        await RDeleteFolderChilds(FolderId,FileId) ;
    }
    catch(e){
        res.status(400).json({
            message : e 
        })   
    }

    res.status(200).json({
        message : "Folder/File Deleted Successfully"
    })
})


app.get("/api/v1/query",authMiddleWare,async(req,res) => {
    const userId   = req.headers.userId ;   
    try{
        const queries  = await QueryCollection.find({ 
            userId : userId 
        }).select("-embedding -userId") ; // do not want embedding and userId here
     //or .select( { embedding : 0 , userId : 0})
        
        res.status(200).json( { queries : queries } ) ;
    }
    catch(e){
        // console.log(e)
        res.status(200).json( { queries : [] } ) 
    }
})

app.post("/api/v1/query",authMiddleWare,async(req,res) => {
    const userId = req.headers.userId ;
    const query   : string = req.body.query ;
    const queryId : string = req.body.queryId ;
    const FileId  : string | null = req.body.FileId  ; 

    const content = await runQueryVectorSearch(query,queryId,userId as string,FileId) ;

    res.status(200).json( { 
        searchedContent : content 
    }) ;
})

app.delete("/api/v1/query",authMiddleWare,async(req,res) => {
    const userId  : string = req.headers.userId as string ;
    const queryId : string = req.headers.queryid as string;

    await QueryCollection.deleteOne({
        _id    : queryId , 
        userId : userId
    })

    res.status(200).json( { 
        message : "content deleted successfully" 
    }) ;
})

async function run(){
    await mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING!) ; 
    // await createVectorSearchIndex() ; // run only one time  // creating a search index in MongoDB Atlas -> if shows no error and show falied then go to your cluster to check if it show pending
    app.listen(3000) ; 
}

run() ; 
