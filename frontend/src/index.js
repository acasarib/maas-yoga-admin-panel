import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "./context/Context";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
//ver licencia x-date-pickers-pro

const root = ReactDOM.createRoot(
  document.getElementById("root")
);
root.render(
  <Provider>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <App />
    </LocalizationProvider>
  </Provider>
);