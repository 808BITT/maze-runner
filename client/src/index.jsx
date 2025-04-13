import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

console.log('VITE_DEBUG:', import.meta.env.VITE_DEBUG);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);