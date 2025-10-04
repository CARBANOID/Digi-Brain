import axios from "axios"
import { BACKEND_URL } from "../pages/config"
import { useEffect, useState } from "react"

export const useGetQueries = () =>{
    const [queries,setQueries] = useState<any>([]) ;
    const RefreshQueries = async() =>{
        const response = await axios.get(`${BACKEND_URL}api/v1/query`) ;
        setQueries(response.data.queries) ; 
        return response.data.queries ; 
    }

    useEffect(() =>{
        RefreshQueries() ; 
    })

    return {queries,RefreshQueries} ;
}