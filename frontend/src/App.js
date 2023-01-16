import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Banner from "../frontend/src/components/pages/banner";
import Home from "../frontend/src/components/pages/home";
import './input.css';

export default function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
  );
}