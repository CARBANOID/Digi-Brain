import axios from "axios";
import { BACKEND_URL } from "../pages/config";

export const useDeleteFileFolder = async(FolderId? : string ,FileId? : string ,parentfolderid? : string) =>{
    await axios.delete(`${BACKEND_URL}api/v1/FolderFile`,
    {
        headers :{
            token : localStorage.getItem("token") ,
            folderid : FolderId ,
            fileid : FileId ,
            parentfolderid : parentfolderid
        }
    }) ; 
}
