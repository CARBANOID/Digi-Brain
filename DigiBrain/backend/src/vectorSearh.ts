import { VoyageAIClient } from "voyageai";
import * as dotenv from 'dotenv' ;
import type { EmbedResponse } from "voyageai/api/index.js";
import { ContentCollection, QueryCollection } from "./db.js";
dotenv.config() ;

const VoyageClient = new VoyageAIClient( {apiKey : process.env.VOYAGE_API_KEY } )

export const getEmbedding = async(text : string) =>{
    const response : EmbedResponse = await VoyageClient.embed({
        input : text ,
        model : "voyage-3-large" 
    })
    return (response.data != undefined && response.data[0] != undefined) ? response.data[0].embedding : [] ;
} ;  


export const createVectorSearchIndex = async() => {
    try{
        const searchIndex = {
            name : "contentIndex",
            type : "vectorSearch",
            definition : {
                "fields" : [
                    {
                    "type"          : "vector",
                    "path"          : "embedding",
                    "similarity"    : "dotProduct" ,
                    "numDimensions" :  1024
                    }
                ]
            }
        }
        const result = await ContentCollection.createSearchIndex(searchIndex) ;
        console.log( result + " : Content Vector Search Index Creation Successful") ;
    }
    
    catch(e){
        console.log(e) ;  
        console.log("Content Vector Search Index Creation Failed") ;
    } 
}

export const runQueryVectorSearch = async(query : string,queryId : string | undefined,userId : string) => {
   try{
        let queryEmbedding ;
        if (queryId) {
            // const queryFound = await QueryCollection.findOne( { query : query } ) ; 
            const queryFound = await QueryCollection.findOne( { _id : queryId } ) ; 
            queryEmbedding = queryFound!.embedding ;
        }
        else {
            console.log("Query Embedding Generated") ; 
            queryEmbedding = await getEmbedding(query) ; 
            await QueryCollection.create({
                query     : query,
                userId    : userId,
                embedding : queryEmbedding
            }) ; 
        }
        
        const pipeline = [  
            {
                $vectorSearch : {
                    index       : "contentIndex",
                    queryVector : queryEmbedding,
                    path        : "embedding",
                    exact       : true ,
                    limit       : 20
                }
            },
            {
                $project : {
                    embedding : 0 ,
                    score: { $meta: "vectorSearchScore" } 
                }
            },
            {
                $match : {    // filter by similarity threshold
                    score : { $gte : 0.8 }
                }
            }
        ]

        // @ts-ignore 
        const response = await ContentCollection.aggregate(pipeline) ;
        return response ;
    }
    catch(e){
        // console.log(e) ;
        return [] ;
    }  
} 