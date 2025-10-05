import { memo, useContext, useEffect, useRef, useState } from "react";
import { IconMap } from "../icon/IconComponents";
import { Button } from "./Button";
import { Input } from "./Input";
import axios from "axios";
import { BACKEND_URL } from "../../pages/config";
import { currentFileContext } from "../../pages/dashboard";

type PopUpBoxProps = {
    isPopUpOpen    : boolean ,
    ClosePopUpBox  : () => void ,
    RefreshContent : () => Promise<any> ,
}
// Controlled Component -> Element Rendering is controlled by the parent state
export const PopUpBox = memo(({ isPopUpOpen , ClosePopUpBox , RefreshContent  } : PopUpBoxProps ) => {

    const CloseIcon      = useRef(IconMap["Close"]) ;  
    const DigiBrainIcon  = useRef(IconMap["DigiBrain"]) ;  

    const ModalRef       = useRef<HTMLDivElement>(null) ;  // refers to the PopUp Main Content 
    const titleRef       = useRef<HTMLInputElement>(null) ; 
    const descriptionRef = useRef<HTMLTextAreaElement>(null) ; 
    const linkRef        = useRef<HTMLInputElement>(null) ; 
    const contentRef     = useRef<HTMLSelectElement>(null) ; 
    
    const [tags,setTags] = useState<Array<string>>([]) ;
    const InputTagRef    = useRef<HTMLInputElement>(null) ;
    
    const createTag = () =>{
        if(InputTagRef.current!.value == "") return ; 
        setTags([...tags,InputTagRef.current!.value]) ;
        InputTagRef.current!.value = "" ;
    }

    const deleteTag = (index : number) =>{
        const newTags = [...tags] ; 
        newTags.splice(index,1) ;
        setTags(newTags) ;
    }

    const fileContext = useContext(currentFileContext) ;
    const addContent  = async() => {        

        if(titleRef.current!.value == ""){
            titleRef.current!.focus() ; 
            return ;
        } 

        if(linkRef.current!.value == ""){
            linkRef.current!.focus() ; 
            return ;
        }
        
        await axios.post(`${BACKEND_URL}api/v1/content`,
            {
                title : titleRef.current!.value,
                description : descriptionRef.current!.value,
                link : linkRef.current!.value ,
                type : contentRef.current!.value ,
                tags : tags 
            },
            {
                headers : {
                    token : localStorage.getItem("token") ,
                    fileid : fileContext.FileId 
                }
            }
        ) ;

        if(!fileContext.FileId) await RefreshContent() ;
        else await fileContext.RefreshFileContentRef.current() ;
        ClosePopUpBox() ;
    }

    
    const checkOutsideClick = (e : MouseEvent) => {
        /*
        e.target tells where the user has clicked 
        .contains() only exists on React Element (like div, span, section, etc.).
        ref.contains(element) returns true if element is inside the referenced element.
        */
        if(isPopUpOpen && ModalRef.current && !ModalRef.current.contains(e.target as Node)) ClosePopUpBox() ;
    }

    useEffect(() => {
       document.addEventListener('mousedown',checkOutsideClick) ;  // to add event on the page
       return function(){
            document.removeEventListener('mousedown',checkOutsideClick) ;
       }
    },[isPopUpOpen])


    // bg-[rgba(51, 65, 85, 1)]  r->red b->blue g->green a->opacity
    return(
    <div>
        {isPopUpOpen && // fixed -> items stay there permanently
            <div className="w-screen h-screen fixed top-0 left-0 bg-[rgba(51,65,85,0.7)] flex justify-center">
            <div className="flex items-center">
               <span className="bg-white p-4 pt-1 rounded-lg " ref={ModalRef} >
                    <div className="flex justify-start">
                        <div className="text-blue-700 cursor-pointer -ml-3" onClick={ ClosePopUpBox }>  
                            {<CloseIcon.current size = "md" />} 
                        </div>
                    </div>

                    <div className="flex justify-center -mt-3 items-center">
                        <div className="font-bold pl-1 text-2xl text-indigo-800">
                            Digi Brain
                        </div>
                        <div className="pl-1">
                            <DigiBrainIcon.current size="md"/>
                        </div>
                    </div>

                    <div className="pt-3">
                        <div className="pl-2 font tracking-wide text-sm  text-gray-700"> Title (required)  </div>
                        <Input ref = {titleRef} inputVaraint="TextBox"  size = "md" placeholder={"Enter a title"}/>

                        <div className="pl-2 font tracking-wide text-sm  text-gray-700"> Description  </div>
                        <Input ref = {descriptionRef} inputVaraint="TextArea" size = "lg" placeholder={"Tell us more about it"}/>

                        <div className="pl-2 font tracking-wide text-sm  text-gray-700"> Content Type  </div>
                        <Input ref = {contentRef} inputVaraint="Menu" placeholder = "Content Type" size = "md"/>
                
                        <TagBox tags={tags} createTag={createTag} InputTagRef={InputTagRef} deleteTag={deleteTag}/>

                        <div className="pt-3 pl-2 font tracking-wide text-sm  text-gray-700"> Link (required) </div>
                        <Input ref = {linkRef} inputVaraint="TextBox"  size = "md" placeholder={"https://example.com"}/>
                    </div>
                    <div className="p-1"></div>
                    <div className="flex justify-center">
                    <Button varaint="secondary" size ="md" text="Submit" onClick={ addContent } />
                    </div>
                </span> 
            </div>
            </div>
        }
    </div>
    )
})

const TagBox = (props : any) =>{
    return(
        <div>
            <div className="pt-1 pl-2 pb-2 font tracking-wide text-sm text-gray-700"> Tags </div>
            <div className="ml-2 min-w-72 max-w-84 h-20 scrollbar-hide scroll overflow-y-scroll overflow-hidden border rounded-md">
                <div className="flex flex-wrap gap-1 mt-1">
                { props.tags.map((text : string,index : number) => <Tag key={index + 1} index={index} text={text} deleteTag={props.deleteTag} /> ) }

                <InputTag ref ={props.InputTagRef} createTag={props.createTag}/>
                </div>
            </div>
        </div>
    )   
}


const InputTag = (props : any) =>{
    const OkIcon = useRef(IconMap['Ok']) ; 
    
    return(
        <div className="mt-1 ml-2 flex justify-start">
            <input type="text" ref={props.ref}
             className="bg-[#dce4fb] text-[#535892] mt-1 pl-3 pr-6 w-35 text-[14px] rounded-full font-semibold"
             onKeyDown={ (e) =>{
                if(e.key == "Enter") props.createTag() ;
             }}
            />
            <div className="flex -ml-6 mt-2 " onClick={props.createTag}>
                <OkIcon.current size="xs" customSize="size-4"/> 
            </div>
        </div>
    )
}

const Tag = (props : any) =>{
    const NotOkIcon = useRef(IconMap['NotOk']) ; 
    return(
        <div className="mt-1 ml-1">
            <div className="flex items-center justify-start break-words bg-[#dce4fb] text-[#535892] mt-1 pl-1 pr-3  text-[14px] rounded-full font-semibold  ">
                <div className="pr-1" onClick={ () => props.deleteTag(props.index) }> 
                    <NotOkIcon.current size="xs" customSize="size-3"/> 
                </div>
                {props.text}
            </div>
        </div>
    )
}



