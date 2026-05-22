import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter } from 'react-router-dom';
import Routes from '@/routes';
function App() {
    return (_jsx(BrowserRouter, { children: _jsx(Routes, {}) }));
}
export default App;
//# sourceMappingURL=App.js.map