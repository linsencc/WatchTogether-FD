import React from "react";
import ReactDOM from 'react-dom/client';
import Content from "./content";


// 注入元素
const domContainer = document.createElement('div');
document.body.append(domContainer);
const root = ReactDOM.createRoot(domContainer);
root.render(<Content />);
// root.render(<React.StrictMode> <Content /></ React.StrictMode>);