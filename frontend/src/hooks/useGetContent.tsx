import axios from "axios";
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../pages/config";

export const useContent = (FileId? : any) => {
    const [contents,setContents] = useState<any>([]) ; 

    const RefreshContent = async() => {
        const response = await axios.get(`${BACKEND_URL}api/v1/content`,
            {
                headers : { 
                    token : localStorage.getItem("token") ,
                    fileid : FileId 
                }
            }
        ) ;
        setContents(response.data.userContent) ;   
        return response.data.userContent;
    }

    useEffect(() =>{
        RefreshContent() ;
    },[]) ; 

    return {contents,setContents,RefreshContent} ; 
}