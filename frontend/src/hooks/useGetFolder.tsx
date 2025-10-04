import axios from "axios";
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../pages/config";

export const useGetFolder = (FolderId? : string) =>{
    const [Folders,setFolders] = useState<any>([])
 
    const RefreshFolders = async() =>{
        const response = await axios.get(`${BACKEND_URL}api/v1/folder`,{
            headers : {
                token : localStorage.getItem("token"),
                folderid : FolderId 
            }
        }) ; 
        setFolders(response.data.FoldersAndFiles)
        return response.data.FoldersAndFiles ;
    }

    useEffect(() => {
        RefreshFolders() ;
    },[])

    return { Folders ,setFolders ,RefreshFolders} ; 
}