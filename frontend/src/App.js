import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Banner from "./pages/banner";
import Home from "./pages/home";

import './input.css';

export default function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/home" element={<Home payments />} />
          <Route path="/home/payments" element={<Home payments />} />
          <Route path="/home/new-user" element={<Home newUser />} />
          <Route path="/home/tasks" element={<Home tasks />} />
          <Route path="/home/balance" element={<Home balance />} />
          <Route path="/home/courses" element={<Home courses />} />
          <Route path="/home/students" element={<Home students />} />
          <Route path="/home/colleges" element={<Home colleges />} />
        </Routes>
      </Router>
  );
}