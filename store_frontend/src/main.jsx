// main.jsx
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ReactDOM from 'react-dom/client';
import React from 'react';
import { HashRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>

        <App />
      </HashRouter>

    </AuthProvider>
  </React.StrictMode>,
);