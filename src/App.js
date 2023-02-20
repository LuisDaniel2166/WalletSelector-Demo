import './App.css';
import { Routes, Route } from "react-router-dom"
import Home from "./views/home"
import About from "./views/About"

function App() {
  return (
    <div className="App bg-slate-600">
      <Routes>
        <Route path="/" element={ <Home/> } />
        <Route path="about" element={ <About/> } />
      </Routes>
    </div>
  );
}

export default App;
