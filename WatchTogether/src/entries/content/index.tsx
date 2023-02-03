import ReactDOM from 'react-dom/client';
import Content from "./App";


const domContainer = document.createElement('div');
document.body.append(domContainer);
const root = ReactDOM.createRoot(domContainer);
root.render(<Content />);