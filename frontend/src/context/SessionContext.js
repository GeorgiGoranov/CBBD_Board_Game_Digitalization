import { createContext, useReducer } from "react"

export const SessionContext = createContext()


export const sessionReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SESSIONS':
            return {
                sessions: action.payload
            }
        case 'CREATE_SESSIONS':
            return {
                sessions: [action.payload, ...state.sessions]
            }
        case 'DELETE_SESSION':
            return {
                sessions: state.sessions.filter(session => session.code !== action.payload) // Remove the session by ID
            };
        case 'UPDATE_SESSION':
            return {
                sessions: state.sessions.map(session =>
                    session.code === action.payload.code ? action.payload : session
                ) // Update the specific session with new data
            }
        default:
            return state
    }
}
//the children represent the passed/ wraped componenets in the provider in our case App.
export const SessionContextProvider = ({ children }) => {

    const [state, dispatch] = useReducer(sessionReducer, {
        session: null
    })


    //we are outputing the wraped App components back so that they can be rendered with the wrap
    return (
        <SessionContext.Provider value={{ ...state, dispatch }}>
            {children}
        </SessionContext.Provider>
    )
}