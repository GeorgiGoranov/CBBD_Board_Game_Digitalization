
import React, { createContext, useRef } from 'react';
import initSocket from './socket';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(initSocket());  // single socket instance

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
