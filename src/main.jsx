import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // This imports the Tailwind CSS styles
import { store, persistor } from "./redux/store.js";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { RideProvider } from './context/RideContext';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <RideProvider>
          <App />
        </RideProvider>
      </Provider>
    </PersistGate>
  </React.StrictMode>
);