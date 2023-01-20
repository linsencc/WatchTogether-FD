import React from "react";
import ReactDOM from 'react-dom/client';
import Content from "./content";
import Draggable from 'react-draggable';

// 注入元素
const domContainer = document.createElement('div');
document.body.append(domContainer);
const root = ReactDOM.createRoot(domContainer);
root.render( /*#__PURE__*/React.createElement(Draggable, null, /*#__PURE__*/React.createElement(Content, null)));
// root.render(<React.StrictMode> <Content /></ React.StrictMode>);