import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "./context/Context";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
//ver licencia x-date-pickers-pro
import 'dayjs/locale/es';

const root = ReactDOM.createRoot(
  document.getElementById("root")
);
root.render(
  <Provider>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <App />
    </LocalizationProvider>
  </Provider>
);