import { createContext, useReducer } from "react";

export const SessionContext = createContext();

export const sessionReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SESSIONS':
            return {
                sessions: action.payload || []
            };
        case 'CREATE_SESSIONS':
            return {
                sessions: [action.payload, ...state.sessions]
            };
        case 'DELETE_SESSION':
            return {
                sessions: state.sessions.filter(session => session.code !== action.payload)
            };
        case 'DELETE_SESSION_PROFILE':
            return {
                sessions: state.sessions.filter(session => session._id !== action.payload)
            };
        case 'UPDATE_SESSION':
            return {
                sessions: state.sessions.map(session =>
                    session.code === action.payload.code ? action.payload : session
                )
            };
        default:
            return state;
    }
};

export const SessionContextProvider = ({ children }) => {
    // Correct initial state: sessions should be an empty array
    const [state, dispatch] = useReducer(sessionReducer, {
        sessions: []
    });

    return (
        <SessionContext.Provider value={{ ...state, dispatch }}>
            {children}
        </SessionContext.Provider>
    );
};
