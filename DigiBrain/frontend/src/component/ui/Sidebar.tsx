import { memo, useContext, useEffect, useRef, useState } from "react";
import { IconMap } from "../icon/IconComponents";
import { Button } from "./Button";
import { FileSystem } from "./FileSystem";
import { currentFileContext } from "../../pages/dashboard";


type Variants =  "primary" | "secondary" ;
type Sizes    = "sm" | "md" | "lg" 

type VariantRecord = Record<Variants,string> ;
type SizeRecord    = Record<Sizes,string> ; 


type SideBarProps = {
    varaint        : Variants ;
    title          : string ;
    size           : Sizes ; 
    share          : boolean ;
    SideBarVisible : boolean ;
    shareBrain     : () => void,
    OpenPopUpBox   : () => void ,
    ChangePage     : (...args : any[]) => any ;  // ...args refers variable number of parameter / Rest parameter in typescript
}

namespace SideBarStyle{
    export const varaint : VariantRecord = {
        "primary"   :   "bg-white text-[#37393b] ",
        "secondary" : "bg-[#ededed] text-[#37393b] "
    }

    export const size : SizeRecord = {
        "sm" : `h-screen transition-all duration-1000 w-0 sm:w-55 md:w-72`,
        "md" : "h-screen",
        "lg" : "h-screen"
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


type SideBarIconProps = {
    varaint      : Variants ;
    Icon         : string ;
    title?       : string ;    
    size         : Sizes ; 
    customStyle? : string ,
    onClick      : (page : string) => void ;
}

const DefaultSideBarStyle = "fixed left-0 top-0 rounded-md border-2 border-gray-200 pt-4" ;

export const SideBar = memo((props : SideBarProps) => {
    const DigiBrainIcon = useRef(IconMap["DigiBrain"]) ; 
    const FileContext   = useContext(currentFileContext) ;

    const [SideBarVisible,setSideBar] = useState(false) ;

    useEffect(() => {
       const clock = setTimeout(() => setSideBar(props.SideBarVisible),300) ;
       return function(){
        clearTimeout(clock) ;
       }
    },[props.SideBarVisible])

    return(
        <div className={`${SideBarStyle.varaint[props.varaint]} ${SideBarStyle.size[props.size]} ${DefaultSideBarStyle} ${props.SideBarVisible ? 'w-full' : ""} `}>
            <div className={`transition-all duration-100 ${SideBarVisible ? 'opacity-100' : 'opacity-0'} sm:opacity-100 `}>
                <div className="pt-20 sm:pt-0">
                    <div className="flex items-center pl-3">

                        <div className={`mt-2 flex opacity-0 transition-all duration-1000 sm:opacity-100 ${SideBarVisible ? 'opacity-100' : ''}`}>
                            <div className={`font-bold  text-2xl sm:text-xl md:text-2xl text-indigo-800`}>
                            Digi Brain
                            </div>
                            <div className="pl-1"> </div>
                            <DigiBrainIcon.current size="lg"/>
                        </div>
                        <div className="ml-4 flex pl-10 pt-2 ">
                            {   
                                !FileContext.share && props.SideBarVisible && 
                                <div className={`flex gap-2 opacity-0 transition-all duration-1000 sm:opacity-100 ${SideBarVisible ? 'opacity-100' : ''}  sm:hidden`}> 
                                    <div> <Button varaint="primary" size ="xs" text="" startIcon={IconMap["Share"]} onClick={props.shareBrain} /> </div> 
                                    <div> <Button varaint="secondary" size ="xs" text=""startIcon={IconMap['Plus']} onClick={props.OpenPopUpBox} /> </div>
                                </div>
                            }
                        </div>
                    </div>

                    <div className="hidden sm:block border-1 mt-[28px] border-gray-300"></div>

                </div>

                <div className={`pt-5 pl-[9px] opacity-0 transition-all duration-1000 flex sm:opacity-100 ${SideBarVisible ? 'opacity-100' : ''}`}>
                    <div className="ml-[4px] text-lg font-semibold text-gray-600 rounded-md tracking-wide">
                        Your Folder & Files
                    </div>
                </div>

                <FileSystem/> 
            
            </div>
        </div>
    )
})


export const SideBarItem = memo((props : SideBarIconProps) => {
    const ContentIcon = useRef(IconMap[props.Icon]) ;
    return(
        <div className={`flex items-center p-3 cursor-pointer hover:bg-gray-200 ${props.customStyle}`} onClick={ () => { props.onClick(props.Icon) } } >
            <div className="pr-2"> 
                <ContentIcon.current size = {props.size} />
            </div> 
            <div className=" tracking-wide">
                {props.title}
            </div>
        </div>
    )
})


