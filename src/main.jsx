import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/theme.css'; // เราจะย้าย CSS มาไว้ที่นี่ในเฟสต่อไป

// Bootstrapping the Vennamis Ecosystem
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);