import { memo, type ComponentType } from "react";   // type ReactElement is another component
import { type IconProps } from "../icon/IconComponents";

type Variants =  "none" | "primary" | "secondary" ;
type Sizes    =  "xs" | "sm" | "md" | "lg" 

type VariantRecord = Record<Variants,string> ;
type SizeRecord    = Record<Sizes,string> ; 

// Button 
type ButtonProps = {
    varaint    : Variants ;
    size       : Sizes ; 
    text       : string ; 
    hideText?  : boolean ;
    startIcon? : ComponentType<IconProps>   ;
    endIcon?   : ComponentType<IconProps> ;
    onClick?   : () =>  void ; 
}

namespace ButtonStyle{
    export const varaint : VariantRecord = {
        "none"      : "",
        "primary"   : "bg-[#dce4fb] text-[#535892]",
        "secondary" : "bg-[#4740d6] text-[#ceceff]"
    }

   export const animation : VariantRecord = {
        "none"      : "" ,
        "primary"   : "" ,
        "secondary" : "transition-all duration-1000 hover:opacity-80"
    }

    export const padding : SizeRecord = {
        "xs" : "py-[5px] pr-[1px] pl-[4px] rounded-md" ,
        "sm" : "py-[9px]  pr-[12px] pl-[12px] rounded-md",
        "md" : "py-[8px]  pr-[20px] pl-[20px] rounded-lg",
        "lg" : "py-[7px]  pr-[30px] pl-[30px] rounded-lg"
    }

    export const textSize : SizeRecord = {
        "xs" : "" ,
        "sm" : "text-[15px]",
        "md" : "text-[17px]",
        "lg" : "text-[19px]"
    }

   export const size : SizeRecord = {
        "xs" : "" ,
        "sm" : "",
        "md" : "",
        "lg" : "w-72 h-10"
    }
}


const ButtonDefaultStyles = "flex items-center justify-center font-medium cursor-pointer"

// Components 
export const Button = memo((props : ButtonProps) =>{
    return(     
      <div>
        <button onClick = {props.onClick} 
        className ={`${ButtonStyle.varaint[props.varaint]} ${ButtonStyle.padding[props.size]}  ${ButtonStyle.textSize[props.size]} 
        ${ButtonStyle.size[props.size]}  ${ButtonStyle.animation[props.varaint]} ${ButtonDefaultStyles}`}
        >
           {props.startIcon ? <div className="pr-2"> {<props.startIcon size={props.size}/>} </div> : null }
            <div className={`${(props.hideText) ? 'hidden lg:block' : ''}`}>
            {props.text}  
            </div>
           {props.endIcon ? <div className="pr-2">  {<props.endIcon size={props.size}/>} </div> : null }
        </button>   
      </div>
    )
})
