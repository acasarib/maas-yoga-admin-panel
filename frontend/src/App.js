import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Banner from "./pages/banner";
import Home from "./pages/home";
import Balance from "./pages/balance";
import Payments from "./pages/payments";
import Tasks from "./pages/tasks";
import NewUser from "./pages/newUser";
import Calendar from "./pages/calendar";


import './input.css';

export default function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/home" element={<Home />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/new-user" element={<NewUser />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/balance" element={<Balance />} />
        </Routes>
      </Router>
  );
}