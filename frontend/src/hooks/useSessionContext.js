import { useContext } from "react"
import { SessionContext } from "../context/SessionContext"

export const useSessionsContext = () =>{
    const context = useContext(SessionContext)

    if(!context){
        throw Error('useSessionContext must be inside an UserContextProvider')
    }

    return context
}