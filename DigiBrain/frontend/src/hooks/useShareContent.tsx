import axios from "axios";
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../pages/config";


export const useShareContent = (shareLink : string) => {
    const [contents,setContents] = useState([]) ; 

    const RefreshContent = async() => {
        const response = await axios.get(`${BACKEND_URL}api/v1/brain/${shareLink}`) ;
        setContents(response.data.userContent) ;
    }

    useEffect(() =>{
        RefreshContent() ;
    },[]) ; 

    return {contents,setContents,RefreshContent} ; 
}