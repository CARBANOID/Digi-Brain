import { memo, useContext, useRef, useState } from "react";
import { IconMap } from "../icon/IconComponents";
import { useGetFolder } from "../../hooks/useGetFolder";
import { useAddFileFolder } from "../../hooks/useAddFileFolder";
import { Input } from "./Input";
import { currentFileContext } from "../../pages/dashboard";
import { useContent } from "../../hooks/useGetContent";
import { useDeleteFileFolder } from "../../hooks/useDeleteFileFolder";


type FolderFileDivProps = {
    FolderId?           : string ,
    FileId?             : string  ,
    ParentFolderId?     : string ,
    RefreshParentFolder : () => Promise<void>
}


export const FileSystem = memo(() => {
    const OkIcon         = useRef(IconMap["Ok"]) ;
    const NotOkIcon      = useRef(IconMap["NotOk"]) ;
    const AddFolderIcon  = useRef(IconMap["AddFolder"]) ;
    
    const folderNameRef  = useRef<HTMLInputElement>(null) ;

    const {Folders,setFolders,RefreshFolders} = useGetFolder() ; 
    const RefreshCurrentFolder = async() => setFolders(await RefreshFolders()) ;
    const [FolderInputScreen,SetFolderInputScreen] = useState(false) ; 

    const FileContext = useContext(currentFileContext) ;

    return(
        <div className=" items-center p-3 sm:p-2 md:p-4 "> 
            <div className="scrollbar-hide scroll overflow-y-scroll overflow-hidden h-130 w-70 sm:w-50 md:w-60 border-2 border-gray-600 rounded-lg p-2 ">     
                {
                    Folders.map(({ _id } : {_id : string} ,index : number) => 
                        <FolderDiv key={index + 1} FolderId={_id} ParentFolderId={undefined} RefreshParentFolder={RefreshCurrentFolder}/>
                    )
                }

                {/* To Add Top Level Folders */}
                <div className="mt-2"> 
                    <div className={`flex rounded-md ${FolderInputScreen ? " border-2  bg-gray-300" : "" }  items-center`}>

                        {
                            !FileContext.share &&
                            <div className={`p-1 rounded-md cursor-pointer hover:bg-slate-300 ${ FolderInputScreen ? "" : " border-1 bg-gray-300" } `} onClick={ () => SetFolderInputScreen(true)}>
                                <AddFolderIcon.current size="sm" />
                            </div>
                        }

                        {
                        FolderInputScreen && 
                        <div className="flex items-center">
                            <div> <Input inputVaraint="Folder-File" size="fs" ref={folderNameRef} customStyle="px-2 rounded-md" placeholder="name"/> </div>
                            <div className="bg-gray-300 cursor-pointer ml-2" onClick={ async() => {
                                    SetFolderInputScreen(false) ; 
                                    await useAddFileFolder(folderNameRef.current!.value) ;
                                    await RefreshFolders() ; 
                            }}>
                                <OkIcon.current size="sm" customSize="size-5"/>
                            </div>
                            <div className="bg-gray-300  cursor-pointer ml-2" onClick={ () => {
                                    SetFolderInputScreen(false) ; 
                            }}>
                                <NotOkIcon.current size="sm" customSize="size-5"/>
                            </div>
                        </div>
                        }
                    </div>
                </div> 
            </div>
        </div>
    )
})

const FolderDiv = memo((props : FolderFileDivProps) => {
    const FolderIcon    = useRef(IconMap["Folder"]) ; 
    const AddFolderIcon = useRef(IconMap["AddFolder"]) ; 
    const AddFileIcon   = useRef(IconMap["AddFile"]) ; 
    const OkIcon        = useRef(IconMap["Ok"]) ;
    const NotOkIcon     = useRef(IconMap["NotOk"]) ;
    const DeleteIcon    = useRef(IconMap["Delete"]) ;

    const [ShowChilds,setShowChilds] = useState(false) ;
    const ToggleChildVisibilty = ()  => setShowChilds(!ShowChilds)

    const [addFile,setAddFile]           = useState(false) ;
    const [addFolder,setAddFolder]       = useState(false) ;


    const folderRef = useRef<HTMLInputElement>(null) ;
    const fileRef   = useRef<HTMLInputElement>(null) ;

    let {Folders,setFolders,RefreshFolders} = useGetFolder(props.FolderId) ;
    const RefreshCurrentFolder = async() => setFolders(await RefreshFolders()) ;

    const FileContext = useContext(currentFileContext) ;

    return(
        <div>
            {/* Folder Style */}
            <div className="cursor-pointer min-w-55 sm:min-w-40 md:min-w-50 w-max p-1 border-2 border-gray-600 rounded-sm mt-1 bg-gray-200 hover:bg-slate-300" onClick={ToggleChildVisibilty}>
                 <div className="flex justify-between items-center">
                     <div className="flex items-center pr-2">
                         <div className="pr-1 "> 
                            <FolderIcon.current size="sm" customSize="size-5"/> 
                        </div>
                         <div> 
                            {Folders.folderName} 
                        </div>
                     </div>
                      
                   {  
                   !FileContext.share &&
                    <div className="flex gap-2 items-center">
                         <div onClick={() => {setAddFolder(true) ; setAddFile(false)} }> <AddFolderIcon.current size="sm" customSize="size-5"/> </div>
                         <div onClick={() => {setAddFile(true) ; setAddFolder(false)} }>  <AddFileIcon.current size="sm" customSize="size-4"/> </div>
                         <div onClick={async() => { 
                            await useDeleteFileFolder(props.FolderId,undefined,props.ParentFolderId) ; 
                            await props.RefreshParentFolder() ;
                            FileContext.setFileId(null) ;
                            await FileContext.RefreshContent() ;
                            FileContext.ChangePage("Home") ;
                         } }>  
                         <DeleteIcon.current size="sm" customSize="size-[18px]"/> </div>
                     </div>
                     }
                 </div>
            </div>

            {/* Child Folder and Files */}

            {
            ShowChilds && 
            <div className="pl-2"> 
                {
                Folders.childFolders.map( (id  : any,index : number) => 
                 <FolderDiv key={index + 1} FolderId={id} ParentFolderId={props.FolderId} RefreshParentFolder={RefreshCurrentFolder}/>
                )
                }
                {
                Folders.childFiles.map( (id  : any,index : number) => 
                 <FileDiv key={index + 1} FileId={id} ParentFolderId={props.FolderId} RefreshParentFolder={RefreshCurrentFolder}/>
                )
                }
            </div>
            }

            {/* New Folder and Files */}
            {
            (addFolder || addFile) && 
                <div className="flex items-center mt-1">
                    <div className="ml-2"> 
                        <Input inputVaraint="Folder-File" size="fs" ref={(addFolder) ? folderRef : fileRef}
                        customStyle="px-2 py-3 max-w-37 rounded-md" placeholder={`${addFolder ? "Folder Name" : "File Name"}`}/> 
                    </div>
                    <div className="cursor-pointer ml-2 bg-gray-300 rounded-full border" onClick={ async() => {
                        addFolder ? setAddFolder(false) : setAddFile(false) ;
                        await useAddFileFolder((addFolder ? folderRef.current!.value : undefined), (addFile ? fileRef.current!.value : undefined),props.FolderId) ;
                        await RefreshFolders!() ;
                        setShowChilds(true) ;
                    }}> 
                    <OkIcon.current size="sm" customSize="size-4"/>
                    </div>
                    <div className="cursor-pointer ml-2 bg-gray-300 border rounded-full" onClick={ () => {
                        addFolder ? setAddFolder(false) : setAddFile(false) ;
                    }}>
                    <NotOkIcon.current size="sm" customSize="size-4"/>
                    </div>
                </div>
            }
        </div>
    )
})


const FileDiv = ({FileId , ParentFolderId , RefreshParentFolder} : FolderFileDivProps) => {
    const FileIcon = useRef(IconMap["File"]) ; 
    const DeleteIcon = useRef(IconMap["Delete"]) ;

    const fsContext = useContext(currentFileContext) ;
    const {contents,RefreshContent} = useContent(FileId) ;

    const RefreshFileContent = async() =>{
        const newContents = await RefreshContent() ;
        fsContext.setContents(newContents.contents) ;
    }

    return(
    <div className="cursor-pointer min-w-50 w-max p-1 border-2 border-gray-600 hover:bg-slate-300 rounded-sm mt-1 bg-gray-200" onClick={ () => {
        fsContext.setFileId(FileId) ;
        fsContext.setContents(contents.contents) ;
        fsContext.RefreshFileContentRef.current = RefreshFileContent ;
    }} > 
        <div className="flex justify-between items-center">
            <div className="flex items-center pr-2">
                <div className="pr-1 "> 
                    <FileIcon.current size="sm" customSize="size-4"/> 
                </div>
                <div> 
                    { contents.FileName } 
                </div>
            </div>

            { 
            !fsContext.share &&        
                <div className="flex">
                    <div onClick={async() => 
                        {
                            await useDeleteFileFolder(undefined,FileId,ParentFolderId)
                            await RefreshParentFolder() ;
                        } 
                    }>  <DeleteIcon.current size="sm" customSize="size-[18px]"/> </div>
                </div>
            }
        </div>
    </div>
    )
}