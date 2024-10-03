import React from 'react';
import ReactDOM from 'react-dom/client';
import './SCSS/index.scss';
import App from './App';

import { SessionContextProvider } from './context/SessionContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SessionContextProvider>
      <App />
    </SessionContextProvider>

  </React.StrictMode>
);

