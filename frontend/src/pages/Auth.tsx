import { memo, useRef, useState } from "react";
import { Button } from '../component/ui/Button' ;
import { Input } from  '../component/ui/Input'
import { IconMap } from "../component/icon/IconComponents";
import { BACKEND_URL } from "./config";
import { useNavigate } from "react-router-dom";
import axios from "axios" ; 


export const AuthBox = () => {
    const navigate = useNavigate() ;  // Used to Naviagate to a different page

    const [Auth,setAuth]                   = useState(true)   ;     // true -> SignIn , false -> SignUp 
    const [linkNotHidden,setLink]          = useState(true)   ;
    const [passVisibilty,setPassVisiblity] = useState(false)  ;  
    const [errorMessage,setErrorMessage]   = useState(String) ;

    const [lower,setLower]                 = useState(0) ;
    const [upper,setUpper]                 = useState(0) ;
    const [special,setSpecial]             = useState(0) ;
    const [digit,setDigit]                 = useState(0) ;
    const [passLength,setPassLength]       = useState(0) ;
    const [userLength,setUserLength]       = useState(0) ;
    // const lastChar                         = useRef("")  ;

    const userIcon                         = useRef(IconMap['User'])     ; 
    const LockIcon                         = useRef(IconMap['Lock'])     ; 
    const EyeIcon                          = useRef(IconMap['Eye'])      ; 
    const CloseEyeIcon                     = useRef(IconMap['EyeClose']) ;

    const BodyRef                          = useRef<HTMLDivElement>(null)   ;
    const ButtonRef                        = useRef<HTMLDivElement>(null)   ;
    const usernameRef                      = useRef<HTMLInputElement>(null) ; 
    const passwordRef                      = useRef<HTMLInputElement>(null) ; 

    const animateBody = () => {
        if (!BodyRef.current) return ;
        BodyRef.current.style.setProperty("--anim-time", "2s"); // change duration here

        // Clear old animation
        BodyRef.current.classList.remove("water-fill", "water-empty");
        void BodyRef.current.offsetWidth; // force reflow (restart animation)

        // Apply new animation
        setTimeout(() => BodyRef.current?.classList.add("water-empty"),1250) ;  // filling water
        BodyRef.current.classList.add("water-fill"); // leaving water
    }

    const switchAuth = () => {
        setLink(false) ; 
        setErrorMessage("") ; 
        ButtonRef.current!.style.pointerEvents = "none";
        animateBody();
        setTimeout(() => {
            setAuth(!Auth)
            setLink(true) ; 
            ButtonRef.current!.style.pointerEvents = "auto";
        }, 3000); // wait till animation ends before switching
    }

    const switchPassVisibility = () =>  setPassVisiblity(!passVisibilty) ; 

    const onUserInput = (e : React.InputEvent<HTMLInputElement>) => {
        const pass : string = usernameRef.current!.value ; 
        if(pass.length >=3) setUserLength(1) ;
        else setUserLength(0) ; 
    }

    const onPassInput = (e : React.InputEvent<HTMLInputElement>) => {
        // const char = e.nativeEvent.data ; 

        const pass : string = passwordRef.current!.value ; 
        if(pass.length >= 8) setPassLength(1) ;
        else setPassLength(0) ; 

        // Method 2 -> O(n)
        let lower = 0 , upper = 0 , digit = 0 , special = 0;

        for(let i = 0 ; i<pass.length ; i++){
            let char = pass[i];
            if(char >= 'a' && char <='z') lower ++ ;
            else if(char >= 'A' && char <='Z') upper ++ ; 
            else if(char >= '0' && char <='9') digit ++ ;
            else special ++ ;
        }

        setLower(lower) , setUpper(upper) , setDigit(digit) , setSpecial(special) ; 
       
        /* 
        // Method 1  -> O(1) // Venerable to Password selection 
        if(char == null){  // Backspace
            const lchar = lastChar.current ;
            if(lchar >= 'a' && lchar <='z') setLower(lower-1); 
            else if(lchar >= 'A' && lchar <='Z') setUpper(upper-1); 
            else if(lchar >= '0' && lchar <='9') setDigit(digit-1); 
            else setSpecial(special-1) ;
       }
       else if(char >= 'a' && char <='z') setLower(lower+1) ; 
       else if(char >= 'A' && char <='Z') setUpper(upper+1) ; 
       else if(char >= '0' && char <='9') setDigit(digit+1) ; 
       else setSpecial(special+1) ;

       lastChar.current = (pass.length !=0) ? pass[pass.length-1] : "" ; 
       */
    }

    const SignUp = async() => {
        if(!(userLength)){
            usernameRef.current!.focus() ;
            return ; 
        }
        else if(!(lower && upper && special && digit && passLength)){
            passwordRef.current!.focus() ;
            return ; 
        }

        const username = usernameRef.current!.value ; 
        const password = passwordRef.current!.value ; 
        const response = await axios.post(`${BACKEND_URL}api/v1/signup`,
            {  
            username : username ,
            password : password 
            },
            {
                validateStatus : () => true // to prevent axios from through erros in case status code other than 200 series
            }
        )
        const data = response.data ; 
        if(response.status == 200){
            switchAuth() ; 
            usernameRef.current!.value = "" ;
            passwordRef.current!.value = "" ;
        }
        else{
            setErrorMessage(data.error) ; 
            setTimeout(() => setErrorMessage(""),3000) ;  
        } 
    }

    const SignIn = async() => {
        if(!(userLength)){
            usernameRef.current!.focus() ;
            return ; 
        }
        else if(!(lower && upper && special && digit && passLength)){
            setErrorMessage("wrong username or password!") ;
            setTimeout(() => setErrorMessage(""),3000) ;  
            passwordRef.current!.focus() ;
            return ; 
        }

        const username = usernameRef.current!.value ; 
        const password = passwordRef.current!.value ; 
        const response = await axios.post(`${BACKEND_URL}api/v1/signin`,
            {  
            username : username ,
            password : password 
            },
            {
                validateStatus : () => true 
            }
        )

        const data = response.data ; 
        if(response.status == 200){
            console.log(data.message) ; 
            localStorage.setItem("token",data.token) ;
            // Navigate the user to dashboard
            navigate('/dashboard') ;
        }
        else{
            setErrorMessage(data.error) ; 
            setTimeout(() => setErrorMessage(""),3000) ;  
        }   
    }

    return(
    <div>
        <TopBar/>
        <div className="w-screen h-screen bg-[#eae7ff] flex justify-center items-center">
            <div>
                <div ref = {BodyRef} className={`bg-white p-6 pt-6 pb-7 sm:p-8 sm:pt-6 sm:pl-9 sm:pr-9 items-center rounded-lg`}>
                    <div className="flex justify-center items-center pb-1">
                        <div className="font-bold pl-1 text-2xl text-indigo-800">
                           {(Auth) ? 'Welcome Back!': 'Welcome!' }
                        </div>
                    </div>
                    <div className="flex justify-center text-slate-500 items-center pb-1">
                         {(Auth) ? "Enter your credentials to continue": "Create an account to get started"}
                    </div>
                    <div className="pt-3">
                        <Input onInput = {onUserInput} ref = {usernameRef} inputVaraint="TextBox"  size = "sm" placeholder={"UserName"}  customPadding="px-8" />
                        <div className= "absolute flex -mt-[38px] ml-3 text-gray-600">
                            <span> <userIcon.current size = "sm" customSize="size-5"/> </span>
                        </div>

                        {
                            !Auth &&
                            <div className="pl-3 pt-1 font-normal text-sm">
                            <CondComp text = "At least 3 characters" isCorrect = {userLength}  />
                            </div>
                        }

                        <Input onInput={onPassInput} ref = {passwordRef} inputVaraint="Password" showText={passVisibilty}  size = "sm" placeholder={"Password"} customPadding="px-8"/>
                        <div className= "absolute flex -mt-[38px] ml-3 text-gray-600">
                            <LockIcon.current size = "sm" customSize="size-5"/>
                        </div>

                        <div className= "absolute flex -mt-[38px] ml-67 text-gray-600 cursor-pointer" onClick={switchPassVisibility}>
                            {(passVisibilty) ? <EyeIcon.current size = "sm" customSize="size-5"/> : <CloseEyeIcon.current size = "sm" customSize="size-5"/> }
                        </div>

                        {
                        !Auth && 
                        <div className="pl-3 pt-1 font-normal text-sm tracking-wide">
                            <p className="font-medium pb-1"> Password must contain: </p> 
                            <div className="grid grid-cols-2">
                            <CondComp text = "One uppercase" isCorrect = {upper}  />
                            <CondComp text = "One lowercase" isCorrect= {lower} />
                            <CondComp text = "One special"isCorrect={special} />
                            <CondComp text = "Min 8  characters" isCorrect={passLength} />
                            <CondComp text = "One digit" isCorrect={digit} />
                            </div>
                        </div>
                        }
                    </div>

                    <div className="pt-3"></div>
                    <div ref = {ButtonRef} className="flex justify-center">
                        <Button varaint="secondary" size ="lg" text= { (Auth) ? 'SignIn' : 'SignUp' } onClick={ (Auth) ? SignIn : SignUp }/>
                    </div>
                    {
                    linkNotHidden &&
                    <div className="flex justify-center pt-5">
                        <div className="font-normal text-sm  cursor-pointer" onClick={ switchAuth }>
                        {(Auth) ? `Don't have an account?` : `Have an account?`} 
                        </div>
                        <div className="font-normal text-sm text-blue-700 cursor-pointer pl-1" onClick={ switchAuth }>
                            {(Auth) ? 'Sign Up' : 'Sign In'} 
                        </div>
                    </div>
                    }
                    <div className="flex flex-wrap justify-center font-medium text-sm text-red-600">
                        <div> {errorMessage} </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}


const TopBar = memo(() => {
    const DigiBrainIcon = useRef(IconMap["DigiBrain"]) ; 
    return(
        <div className="w-screen p-2 bg-[#ffffff] border-1 shadow border-gray-400 fixed">
            
             <div className=" flex justify-between items-center">
                <div className="flex justify-start">
                    <div className="pl-2">
                        <DigiBrainIcon.current size="xl"/>
                    </div>
                    <div className="font-semibold text-2xl pl-2 pb-1 sm:pt-0 pt-[3px] text-indigo-800">
                    Digi Brain 
                    </div>
                </div>

                <div className="hidden sm:block">
                    <div className="flex justify-end items-center md:pr-10 md:mt-2 md:-mb-3 font-normal text-gray-600 text-md">
                        <a href = "" className="pr-3 cursor-pointer"> Features </a>
                        <a href = "" className="pr-3 cursor-pointer"> Pricing </a>
                        <a href = "" className="pr-4 cursor-pointer"> Contact </a>
                        <Button varaint="secondary" size = "sm" text="Demo"/>
                    </div>
                </div>

            </div>
            <div className="text-sm font-normal text-gray-600 pl-13">
                Your Digital Notes - Taking Companian
            </div>
        </div>
    );
})


type CondProps = {
    text      : string ,
    isCorrect : number
}

const CondComp = memo((props : CondProps) => {
    const [WrongIcon ,CorrectIcon] = [useRef(IconMap["Wrong"]) , useRef(IconMap["Correct"])] ;
    return( 
    <>
        <div className={`flex gap-[2px] font-sans tracking-wide items-center pb-[2px] ${(props.isCorrect > 0) ? `text-emerald-500` : `text-red-600`} `}>
            {props.isCorrect ? <CorrectIcon.current size= "sm" customSize="size-4"/> : <WrongIcon.current size= "sm" customSize="size-4"/> }
            <p className=" -mt-[3px]"> {props.text} </p>
        </div>
    </>
)})
