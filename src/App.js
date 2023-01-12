import { Outlet } from "react-router-dom";
import Home from "./routes/home";

export default function App() {
  return (
    <div>
      <Home />
      <Outlet />
    </div>
  );
}