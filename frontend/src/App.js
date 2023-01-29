import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Banner from "./pages/banner";
import Home from "./pages/home";

import './input.css';

export default function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/home" element={<Home payments={true} />} />
          <Route path="/home/payments" element={<Home payments={true} />} />
          <Route path="/home/new-user" element={<Home newUser={true} />} />
          <Route path="/home/calendar" element={<Home calendar={true} />} />
          <Route path="/home/tasks" element={<Home tasks={true} />} />
          <Route path="/home/balance" element={<Home balance={true} />} />
          <Route path="/home/courses" element={<Home courses={true} />} />
          <Route path="/home/students" element={<Home students={true} />} />
          <Route path="/home/colleges" element={<Home colleges={true} />} />
        </Routes>
      </Router>
  );
}