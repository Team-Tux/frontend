import React from "react";
import { useLocation, Link } from "react-router-dom";
import routes from "../routes";
import { CBreadcrumb, CBreadcrumbItem } from "@coreui/react";

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname;

  const getRouteName = (p, rs) => {
    const r = rs.find((x) => x.path === p);
    return r ? r.name : false;
  };

  const getBreadcrumbs = (loc) => {
    const out = [];
    loc.split("/").reduce((prev, curr, i, arr) => {
      const p = `${prev}/${curr}`;
      const name = getRouteName(p, routes);
      if (name) out.push({ pathname: p, name, active: i + 1 === arr.length });
      return p;
    });
    return out;
  };

  const crumbs = getBreadcrumbs(currentLocation);

  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem>
        <Link to="/" className="text-reset text-decoration-none">Home</Link>
      </CBreadcrumbItem>
      {crumbs.map((b, i) => (
        <CBreadcrumbItem {...(b.active ? { active: true } : {})} key={i}>
          {b.active ? (
            b.name
          ) : (
            <Link to={b.pathname} className="text-reset text-decoration-none">
              {b.name}
            </Link>
          )}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  );
};

export default React.memo(AppBreadcrumb);
