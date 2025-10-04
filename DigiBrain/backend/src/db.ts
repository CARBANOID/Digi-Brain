import mongoose from "mongoose";
import { number, string } from "zod";
import { required } from "zod/mini";

const Schema = mongoose.Schema ; 
const Types = mongoose.Types ; 

// Defining Schemas

const UserSchema = new Schema({
    username : {type: String , required : true , unique : true },
    password : {type: String , required :true}
}) ; 

const TagSchema = new Schema({
    title : {type: String , required : true , unique : true },
}) ; 

const LinkSchema = new Schema({
    hash   : {type: String , required : true , unique : true },
    userId : {type : Types.ObjectId , ref : 'user' , required : true}
}) ; 


const ContentSchema = new Schema({
    link        : {type: String , required : true },
    type        : {type: String , required : true },
    title       : {type: String , required : true , unique : true },
    description : {type : String} ,
    tags        : [{type : Types.ObjectId , ref : 'tag' , required : true}] ,
    userId      : {type : Types.ObjectId , ref : 'user' , required : true} ,
    embedding : { type : [Number] }
}) ; 


const FolderSchema = new Schema({
    folderName     : {type : String ,required : true} , 
    childFolders   : [ {type : Types.ObjectId , ref : 'folder' } ],
    childFiles     : [ {type : Types.ObjectId , ref : 'file' } ],
    parentFolderId : {type : Types.ObjectId , default : null },
    userId         : {type : Types.ObjectId}
})

const FileSchema = new Schema({
    fileName : {type : String ,required : true} , 
    contents : [ {type : Types.ObjectId , ref : 'content' } ],
})

const QuerySchema = new Schema({
    query     : { type : String , required : true , unique : true} ,
    userId    : { type : Types.ObjectId } ,
    embedding : { type : [Number] }
})

// Creating Collections

const UserCollection    = mongoose.model('user',UserSchema) ; 
const TagCollection     = mongoose.model('tag',TagSchema) ; 
const LinkCollection    = mongoose.model('link',LinkSchema) ; 
const ContentCollection = mongoose.model('content',ContentSchema) ; 
const FolderCollection  = mongoose.model('folder',FolderSchema) ; 
const FileCollection    = mongoose.model("file",FileSchema) ;
const QueryCollection   = mongoose.model("query",QuerySchema) ;

// Exporting Collections 

export { UserCollection , TagCollection , LinkCollection , ContentCollection , FolderCollection , FileCollection , QueryCollection} ;