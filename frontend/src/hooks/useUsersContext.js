import { useContext } from "react"
import { UserContext } from "../context/UserContext"

export const useUsersContext = () =>{
    const context = useContext(UserContext)

    if(!context){
        throw Error('useUsersContext must be inside an UserContextProvider')
    }

    return context
}