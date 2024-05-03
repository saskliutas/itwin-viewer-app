import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import "@itwin/itwinui-react/styles.css";
import "./index.scss";

if (import.meta.env.IMJS_URL_PREFIX) {
  globalThis.IMJS_URL_PREFIX = import.meta.env.IMJS_URL_PREFIX;
}

if (!import.meta.env.IMJS_AUTH_CLIENT_CLIENT_ID) {
  throw new Error(
    "Please add a valid OIDC client id to the .env file and restart the application. See the README for more information."
  );
}
if (!import.meta.env.IMJS_AUTH_CLIENT_SCOPES) {
  throw new Error(
    "Please add valid scopes for your OIDC client to the .env file and restart the application. See the README for more information."
  );
}
if (!import.meta.env.IMJS_AUTH_CLIENT_REDIRECT_URI) {
  throw new Error(
    "Please add a valid redirect URI to the .env file and restart the application. See the README for more information."
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
