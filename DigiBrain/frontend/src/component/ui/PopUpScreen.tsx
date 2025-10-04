import { memo, useContext, useEffect, useRef } from "react";
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
    
    const fileContext    = useContext(currentFileContext) ;
    const addContent     = async() => {        

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
                tags : [] 
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
               <span className="bg-white p-4 pt-1 rounded-lg" ref={ModalRef} >
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
                
                        <div className="pl-2 font tracking-wide text-sm  text-gray-700"> Link (required) </div>
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


