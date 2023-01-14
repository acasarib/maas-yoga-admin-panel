import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Banner from "./pages/banner";
import Home from "./pages/home";

export default function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Banner />}>
            <Route path="/home" element={<Home />} />
          </Route>
        </Routes>
      </Router>
  );
}