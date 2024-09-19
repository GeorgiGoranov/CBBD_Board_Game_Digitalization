import { createContext, useReducer } from "react"

export const UserContext = createContext()


export const userReducer = (state, action) =>{
    switch (action.type) {
        case 'SET_USERS':
            return{
                users: action.payload
            }
        case 'CREATE_USERS':
            return{
                users: [action.payload, ...state.users]
            }
        default:
            return state
    }
}
//the children represent the passed/ wraped componenets in the provider in our case App.
export const UserContextProvider = ({children}) =>{

    const [state, dispatch] = useReducer(userReducer, {
        user: null
    })
    

    //we are outputing the wraped App components back so that they can be rendered with the wrap
    return (
        <UserContext.Provider value={{...state, dispatch}}>
            {children} 
        </UserContext.Provider>
    )
}