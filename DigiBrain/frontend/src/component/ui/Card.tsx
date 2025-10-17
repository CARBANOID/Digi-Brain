import { memo, useRef , useEffect, useContext, Suspense, lazy} from "react";
import { IconMap } from "../icon/IconComponents";
import axios from "axios";
import { BACKEND_URL } from "../../pages/config";
import { currentFileContext } from "../../pages/dashboard";
import { useLoading } from "../../hooks/useLoading";
import { CardLoader } from "./Loader";

type Variants =  "primary" | "secondary" ;
type Sizes    =  "sm" | "md" | "lg" 

type VariantRecord = Record<Variants,string> ;
type SizeRecord    =    Record<Sizes,string> ; 

// Card 
type CardProps = {
    varaint        : Variants ;
    title          : string ;
    url?           : string ;
    size           : Sizes ; 
    description?   : string ;
    ContentType    : "Document" | "Youtube" | "Tweet" ; 
    tags?          : Array<string> ;
    contentId      : string,
    RefreshContent : () => Promise<any> ,
    share          : boolean ,
    ContentPage    : string
}

const CardDefaultStyles = "break-inside-avoid rounded-md item-center border-2 border-gray-200 " ; 

namespace CardStyle{
    export const varaint : VariantRecord = {
        "primary"   :   "bg-[#fefefe] text-[#37393b]",
        "secondary" : "bg-[#ededed] text-[#37393b]"
    }

    export const size : SizeRecord = {
        "sm" : "min-w-50 max-w-87 ",
        "md" : "max-w-85 ",
        "lg" : "max-w-89 "
    }

    export const padding : SizeRecord = {
        "sm" : "p-5",
        "md" : "p-6 ",
        "lg" : "p-7"
    }

    export const textSize : SizeRecord = {
        "sm" : "text-[14px]",
        "md" : "text-[15px]",
        "lg" : "text-[16px]"
    }
}


// Tag
type TagProps = {
    varaint : Variants ;
    size : Sizes ; 
    text : string ; 
}

const TagDefaultStyles = "rounded-full font-semibold "

namespace TagStyle{
    export const varaint : VariantRecord = {
        "primary" : "bg-[#dce4fb] text-[#535892]",
        "secondary" : "bg-[#4740d6] text-[#ceceff]"
    }

    export const padding : SizeRecord = {
        "sm" : "py-[3px]  pr-[10px] pl-[8px] ",
        "md" : "py-[4px]  pr-[8px] pl-[8px] ",  
        "lg" : "py-[4px]  pr-[8px] pl-[8px] "
    }

    export const textSize : SizeRecord = {
        "sm" : "text-[14px]",
        "md" : "text-[15px]",
        "lg" : "text-[16px]"
    }
}

 
const Tweet = lazy(() => import("./embedScripts/Tweet"))
const Youtube = lazy(() => import("./embedScripts/Youtube"))

/*
columns lets the browser flow cards like text.
Without break-inside-avoid, a tall card can be split across two columns (hence the "cut in half").
break-inside-avoid ensures each card stays intact inside its column, making the layout scroll correctly.
*/

export const Card = memo((props : CardProps) => {
    const ContentIcon = IconMap[props.ContentType] ; // The Content Icon needs to re-render 
    const ShareIcon   = useRef(IconMap["Share"])           ;
    const DeleteIcon  = useRef(IconMap["Delete"])          ;
    const FileContext = useContext(currentFileContext)     ; 
    const {loading,setLoading,Load} = useLoading() ; 

    useEffect(() =>{
        const clock = Load(2000) ;
        return () => clearTimeout(clock) ;
    },[loading])

    const deleteCard = async() => {
        await axios.delete(`${BACKEND_URL}api/v1/content`,
            {
                headers : {
                    token : localStorage.getItem("token") ,
                    contentid : props.contentId ,
                    fileid : FileContext.FileId 
                }
            }
        )
        setLoading(true)
        if(FileContext.FileId) await FileContext.RefreshFileContentRef.current() ;
        else await props.RefreshContent() ;    
    } 

    return(
        <div className={`pb-8 ${((props.ContentPage == "Home") || (props.ContentPage == props.ContentType)) ? 'block' : 'hidden'} `}>
            {
            loading ? <CardLoader CardDefaultStyles={CardDefaultStyles}/>: 
            
            <div className ={`${CardStyle.varaint[props.varaint]} ${CardStyle.padding[props.size]} ${CardStyle.size[props.size]} ${CardDefaultStyles}`}>
                <div className="flex justify-between items-start">
                    <div className="flex">
                        <div className="pr-2 text-gray-700 "> 
                            {<ContentIcon size = {"lg"} />} 
                        </div>
                        
                        <div className="text-lg font-semibold tracking-wide pt-[2px] break-words  max-w-50"> 
                            {props.title}  
                        </div> 
                    </div>

                    <div className="flex pl-2 text-gray-500">
                        <div className="pr-2 cursor-pointer"> 
                            <a href= {props.url} target="_blank"> {<ShareIcon.current size = {"sm"} />} </a>
                        </div>
                        {
                            !props.share && 
                            <div className = "cursor-pointer" onClick={ deleteCard } > {
                                <DeleteIcon.current size = {"sm"} />}  
                            </div>
                        }
                    </div>
                </div> 

                <div>
                    <div className="pt-2">
                        {props.description}  
                    </div>
                </div>

                <div className="pt-5">
                    <Suspense fallback={<CardLoader CardDefaultStyles={CardDefaultStyles}/>}>
                    { props.ContentType == "Tweet" && <Tweet url = {props.url} /> }  
                    { props.ContentType == "Youtube" && <Youtube url = {props.url} />}
                    </Suspense>
                </div>
                <div className="pt-3 flex flex-wrap gap-3">
                    { props.tags!.map(( tag : any ) => <Tag key={tag._id} varaint="primary" size= {props.size} text= {tag.title} /> ) }
                </div>
            </div>
        }
        </div>   
    );
})

export const Tag = memo((props : TagProps) =>{
    return( 
    <>
        <span className ={`${TagStyle.varaint[props.varaint]} ${TagStyle.padding[props.size]} ${TagStyle.textSize[props.size]} ${TagDefaultStyles}`}>
            {props.text}  
        </span>
    </>
    )
})