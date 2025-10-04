import { type Ref,memo } from "react";

type InputType =  "TextBox" | "TextArea" | "Password" | "Menu" | "Folder-File";
type Sizes     = "fs"|"es"| "sm" | "md" | "lg" | "xl" 

type VariantRecord = Record<InputType,string> ;
type SizeRecord    = Record<Sizes,string> ; 


type InputProps = {
    inputVaraint   : InputType ;
    size           : Sizes ; 
    placeholder?   : string
    customPadding? : string ; 
    customStyle?   : string ;
    ref?           : Ref<HTMLInputElement> | Ref<HTMLTextAreaElement> |  Ref<HTMLSelectElement> ;
    onInput?       : (e : React.InputEvent<HTMLInputElement>) => void , 
    showText?      : boolean // only for password
    onKeyDown?     : () => void
}

namespace InputStyle{
    export const varaint : VariantRecord = {
        "TextBox"     : "bg-[#dce4fb] text-[#535892]",
        "TextArea"    : "bg-[#4740d6] text-[#ceceff]",
        "Password"    : "bg-[#dce4fb] text-[#535892]",
        "Menu"        : "bg-[#dce4fb] text-[#535892]",
        "Folder-File" : "bg-gray-300 border-2"
    }

    export const size : SizeRecord = {
        "fs" : "min-w-25 max-w-28 h-6", // fs -> folder-file size
        "es" : "min-w-25 " ,
        "sm" : "min-w-72 h-10",
        "md" : "min-w-84 h-11",
        "lg" : "min-w-84 min-h-11",
        "xl" : "h-11 transition-all duration-1000 w-70 sm:w-65 md:w-78 lg:w-95 xl:w-150"
    }

    export const padding : SizeRecord = {
        "fs" : "" ,
        "es" : "" ,
        "sm" : "py-[7px]  pr-[12px] pl-[12px] rounded-md",
        "md" : "py-[8px]  pr-[20px] pl-[20px] rounded-lg",
        "lg" : "py-[9px]  pr-[18px] pl-[12px] rounded-xl",
        "xl" : "py-[9px]  pr-[18px] pl-[12px] rounded-xl"
    }

    export const textSize : SizeRecord = {
        "fs" : "" ,
        "es" : "text-[14px]" ,
        "sm" : "text-[15px]",
        "md" : "text-[17px]",
        "lg" : "text-[19px]",
        "xl" : "text-[19px]"
    }
}

const DefaultInputStyle = "px-4 py-2 border m-2 rounded-md"

export const Input = memo(( props : InputProps ) => {
    return (
        <div>
           {
            props.inputVaraint == "TextBox" && 
            <input type="text" onInput={ props.onInput ? (e : React.InputEvent<HTMLInputElement>) => props.onInput!(e) : () => {} } 
             ref={props.ref as Ref<HTMLInputElement> } spellCheck= {false} placeholder= {props.placeholder} 
             className={`${DefaultInputStyle} ${props.customPadding} ${InputStyle.size[props.size]} `}
            />
           }
           
           {
            props.inputVaraint == "Password" && 
            <input type={props.showText ? 'text' : 'password'} 
                onInput={ props.onInput ? (e : React.InputEvent<HTMLInputElement>) => props.onInput!(e) : () => {}  }
                ref={props.ref as Ref<HTMLInputElement>} spellCheck= {false} placeholder= {props.placeholder}
                className={`${DefaultInputStyle} ${props.customPadding} ${InputStyle.size[props.size]}`} 
                /*
                // Text Not Selection Logic : Does not work when selected Persistantly
                onSelect ={(e) => {
                    const input = e.target as HTMLInputElement;
                    setTimeout(() =>{
                        const pos = input.value.length;
                        input.setSelectionRange(pos, pos) ; // moves cursor to end, removes selection
                    },0)
                }}
                onPaste={(e) => e.preventDefault() }
                onCopy= {(e) => e.preventDefault() }
                onCut={ (e) => e.preventDefault() }
                */
                required 
            />
           }

           {
            props.inputVaraint == "Folder-File" && 
            <input type="text" onInput={ props.onInput ? (e : React.InputEvent<HTMLInputElement>) => props.onInput!(e) : () => {} } 
             ref={props.ref as Ref<HTMLInputElement> } spellCheck= {false} placeholder= {props.placeholder} 
             className={` ${props.customStyle ? props.customStyle : DefaultInputStyle }  ${props.customPadding}  ${InputStyle.varaint[props.inputVaraint]}  ${InputStyle.size[props.size]}`}
             onKeyDown={ props.onKeyDown ? (e : React.KeyboardEvent<HTMLInputElement>) => { if(e.key == "Enter") props.onKeyDown!() ; } : () => {} } 
            />
           }

           { 
            props.inputVaraint == "TextArea" && 
            <textarea ref={props.ref as Ref<HTMLTextAreaElement>}  spellCheck= {false} placeholder= {props.placeholder} 
            className={`${DefaultInputStyle}  ${InputStyle.size[props.size]} overflow-y-scroll scrollbar-hide `}/>
           }

           {
            props.inputVaraint == "Menu" && 
                <select ref={props.ref as Ref<HTMLSelectElement>} className={`${DefaultInputStyle} ${props.customPadding} ${InputStyle.size[props.size]} ${props.customStyle}`}>
                <option value="Tweet"> Tweet </option>
                <option value="Youtube">Video</option>
                <option value="Document">Document</option>
                </select>
           }
        </div>
    )
})