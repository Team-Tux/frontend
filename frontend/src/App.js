import React, { Suspense, useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { CSpinner, useColorModes } from "@coreui/react";
import "./scss/style.scss";

const DefaultLayout = React.lazy(() => import("./layout/DefaultLayout"));

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes("cerebro-theme");
  const storedTheme = useSelector((s) => s.theme);

  useEffect(() => {
    if (!isColorModeSet()) setColorMode(storedTheme);
  }, []);

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="d-flex align-items-center justify-content-center vh-100">
            <CSpinner color="primary" />
          </div>
        }
      >
        <Routes>
          <Route path="*" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;
