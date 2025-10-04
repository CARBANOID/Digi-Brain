import { memo, useContext, useEffect, useRef, useState } from "react";   // type ReactElement is another component
import { Input } from "./Input";
import { IconMap } from "../icon/IconComponents";
import { BACKEND_URL } from "../../pages/config";
import { currentFileContext } from "../../pages/dashboard";
import axios from "axios";

export const SearchBar = memo(() =>{
    const SearchIcon = useRef(IconMap["Search"]) ;
    const UploadIcon = useRef(IconMap["Upload"]) ;

    const queryRef     = useRef<HTMLInputElement>(null) ; 
    const searchBoxRef = useRef<HTMLDivElement>(null)

    const [queries,setQueries]             = useState<Array<any>>([]) ;
    const [showSearchBox,setshowSearchBox] = useState<boolean>(false) ;

    const ToggleSearchBox = () => setshowSearchBox(!showSearchBox) ; 
    const CloseSearchBox  = () => setshowSearchBox(false) ;

    const checkClickOutside = (e : MouseEvent) => {
        if (showSearchBox && searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node))  CloseSearchBox() ; 
    }

    useEffect(() => {
        document.addEventListener("mousedown",checkClickOutside) ; 
    },[showSearchBox])  

    const FileContext = useContext(currentFileContext) ;

    const getUserQueries = async() =>{
        const response = await axios.get(`${BACKEND_URL}api/v1/query`,
            {
                headers : {
                    token : localStorage.getItem("token") 
                }
            }   
        )
        if(queries != response.data.queries) setQueries(response.data.queries) ;
    }

    const searchContent = async(query : string,queryId? : string) =>{
        if(query.length == 0) return ;
        const response = await axios.post(`${BACKEND_URL}api/v1/query`,
            {
                query   : query ,
                queryId : queryId
            },
            {
                headers : {
                    token : localStorage.getItem("token") 
                }
            }
        )
        FileContext.setContents(response.data.searchedContent) ; 
        queryRef.current!.value = query ;
    }

    return(
        <div>
            <div onClick={ () => { ToggleSearchBox() ; getUserQueries() ;} }>
                <Input ref={queryRef} inputVaraint="TextBox" size="xl" placeholder="Search" customPadding="px-9"/>
                <div className="absolute text-gray-500 -mt-[42px] ml-3">
                    <SearchIcon.current size="sm"/>
                </div>
                <div className="absolute text-gray-400 cursor-pointer -mt-[44px] ml-64 sm:ml-59 md:ml-72 lg:ml-89 xl:ml-144" onClick={() => searchContent(queryRef.current!.value) }>
                    <UploadIcon.current size="md"/>
                </div>
            </div>
            {   
                showSearchBox &&
                <div className="bg-white absolute p-2" ref={searchBoxRef}>
                    { queries.map( ({_id,query} : {_id : string , query : string},index : number) => <QueryBox key={index + 1} query={query} queryId={_id} searchContent={searchContent} refreshQueries={getUserQueries} CloseSearchBox={CloseSearchBox}/> )}
                </div>
            }
        </div>
    )
})

type QueryBoxProps = {
    queryId        : string,
    query          : string,
    searchContent  : (query: string, queryId?: string | undefined) => Promise<void>,
    refreshQueries : () => Promise<void>
    CloseSearchBox : () => void
}

const QueryBox = memo(( {queryId, query , searchContent , refreshQueries , CloseSearchBox} : QueryBoxProps ) =>{
    const DeleteIcon  = useRef(IconMap["NotOk"]) ; 
    const DeleteQuery = async() => {
        const response = await axios.delete(`${BACKEND_URL}api/v1/query`,
                    {
                        headers : {
                            token   : localStorage.getItem("token") ,
                            queryId : queryId
                        }
                    }   
                )
        console.log(response.data.message)       
        await refreshQueries() ;  
    }

    return(
        <div>
            <div className="cursor-pointer bg-white hover:bg-gray-200 break-words rounded-md px-3 py-2  w-70 sm:w-65 md:w-78 lg:w-95 xl:w-150">
                <div className="flex items-star justify-between">
                <div className="w-full" onClick={async() => { await searchContent(query,queryId) ; CloseSearchBox()} }> 
                    <div> {query}  </div>
                </div>
                <div className="" onClick={DeleteQuery}> <DeleteIcon.current size="sm"/> </div>
                </div>
            </div>
        </div>
    )
})