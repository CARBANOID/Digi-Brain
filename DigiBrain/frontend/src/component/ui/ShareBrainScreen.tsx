import { memo, useEffect, useRef, useState } from "react";
import { IconMap } from "../icon/IconComponents";
import { Button } from "./Button";
import { Input } from "./Input";
import axios from "axios";
import { BACKEND_URL } from "../../pages/config";

type ShareBrainProps = {
    isBrainShared : boolean ,
    NotshareBrain : () => void
}

export const ShareBrain = memo(({ isBrainShared, NotshareBrain } : ShareBrainProps ) => {
    const [LinkCopied,setLinkCopied] = useState(false) ; 

    const CloseIcon     = useRef(IconMap["Close"]) ;  
    const DigiBrainIcon = useRef(IconMap["DigiBrain"]) ; 
    const CopyIcon      = useRef(IconMap['Copy']) ; 
    const ModalRef      = useRef<HTMLDivElement>(null) ; 
    const LinkRef       = useRef<HTMLInputElement>(null) ;

    const checkOutsideClick = (e : MouseEvent) => {
        if(isBrainShared && ModalRef.current && !ModalRef.current.contains(e.target as Node)) NotshareBrain() ;
    }

    const generateShareLink = async() =>{
        const response = await axios.post(`${BACKEND_URL}api/v1/brain/share`,
            {
                share : true
            },
            {
                headers : {
                    token : localStorage.getItem("token") 
                }
            }
        ) ;
        const shareLink = "http://localhost:5173/brain/"  + response.data.link  ;
        console.log(shareLink) ;
        LinkRef.current!.value = shareLink ;
    }

    const copyLink = async() =>{
        LinkRef.current!.select() ;
        LinkRef.current!.setSelectionRange(0,99999) ;
        await navigator.clipboard.writeText(LinkRef.current!.value) ;
        setLinkCopied(true) ; 
        setTimeout( () => setLinkCopied(false),2000)
    }

    useEffect(() => {
       document.addEventListener('mousedown',checkOutsideClick) ;  
       return function(){
            document.removeEventListener('mousedown',checkOutsideClick) ;
       }
    },[isBrainShared]) 

    return(
    <div>
        {isBrainShared && 
            <div className="w-screen h-screen fixed top-0 left-0 bg-[rgba(51,65,85,0.7)] flex justify-center">
            { LinkCopied && <div className="absolute bg-white p-1 pr-2 pl-2 mt-10 rounded-full ">Link Copied</div>}
            <div className="flex items-center">
               <span className="bg-white p-4 pt-1 rounded-lg" ref={ModalRef} >
                    <div className="flex justify-start">
                        <div className="text-blue-700 cursor-pointer -ml-3" onClick={ NotshareBrain }>  
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

                    <div className="pt-3" onClick={ () => {} }>
                        <Input ref={LinkRef} inputVaraint="TextBox"  size = "lg" placeholder={"Share Link"} customPadding="pl-8"/>
                        <div onClick={ copyLink }
                        className="absolute -mt-[42px] ml-[12px] cursor-pointer text-slate-500 transition-all duration-200 hover:text-indigo-700">
                            <CopyIcon.current size = "sm" customSize="size-6 transition-all duration-1000 hover:size-[27px] "/> 
                        </div>
                    </div>
                    <div className="p-1"></div>
                    <div className="flex justify-center">  
                        <Button varaint="secondary" size ="md" text="Generate" onClick={ generateShareLink } />
                        </div>
                </span> 
            </div>
            </div>
        }
    </div>
    )
})
