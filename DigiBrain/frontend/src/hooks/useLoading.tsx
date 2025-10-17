import { useState } from "react"

export const useLoading = () =>{
    const [loading,setLoading] = useState<boolean>(true) ; 
    const Load = (seconds : number) =>{
        const clock = setTimeout(() => setLoading(false),seconds) ;
        return clock  ;
    }

    return {Load,setLoading,loading} ;
}