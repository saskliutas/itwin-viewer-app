import { ProgressLinear, ThemeProvider } from "@itwin/itwinui-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  AuthorizationProvider,
  AuthorizationState,
  SignInRedirect,
  useAuthorizationContext,
} from "./Authorization";
import { Viewer } from "./Viewer";
import { FillCentered } from "@itwin/core-react";
import "./App.scss";

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme="light">
        <AuthorizationProvider>
          <AppRoutes />
        </AuthorizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/signin-callback" element={<SignInRedirect />} />
      <Route path="/*" element={<Main />} />
    </Routes>
  );
}

function Main() {
  const { state } = useAuthorizationContext();

  return (
    <div className="viewer-container">
      {state === AuthorizationState.Pending ? <Loader /> : <Viewer />}
    </div>
  );
}

function Loader() {
  return (
    <FillCentered>
      <div className="signin-content">
        <ProgressLinear indeterminate={true} labels={["Signing in..."]} />
      </div>
    </FillCentered>
  );
}
