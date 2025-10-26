import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CContainer, CSpinner } from "@coreui/react";
import routes from "../routes";

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((r, i) =>
            r.element ? (
              <Route key={i} path={r.path} exact={r.exact} name={r.name} element={<r.element />} />
            ) : null
          )}
        </Routes>
      </Suspense>
    </CContainer>
  );
};

export default React.memo(AppContent);
