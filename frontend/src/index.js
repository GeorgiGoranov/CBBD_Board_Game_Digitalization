import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './SCSS/index.scss';
import App from './App';


import { SessionContextProvider } from './context/SessionContext';
import { SocketProvider  } from './context/SocketContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <SessionContextProvider>
    <SocketProvider>
      <App />
    </SocketProvider>
  </SessionContextProvider>


);

