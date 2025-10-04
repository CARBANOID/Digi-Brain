import axios from "axios";
import { BACKEND_URL } from "../pages/config";

export const useAddFileFolder = async(FolderName? : string ,filename? : string ,parentfolderid? : string) =>{
    await axios.post(`${BACKEND_URL}api/v1/FolderFile`,{
        foldername : FolderName ,
        filename : filename ,
        parentfolderid : parentfolderid
    },
    {
        headers :{
            token : localStorage.getItem("token") 
        }
    }) ; 

    // console.log(response.data.message) ;
}
