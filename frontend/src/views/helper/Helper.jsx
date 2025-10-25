import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardSubtitle,
  CCardText,
  CBadge,
  CButton,
} from "@coreui/react";
const defaultUser = {
  firstName: "",
  lastName: "",
  organization: ""
};

async function getUserData() {
  try {
    const response = await fetch("/user.json");
    const data = await response.json();
    return data && data.length > 0 ? data[0] : defaultUser;
  } catch (e) {
    return defaultUser;
  }
}

function Helper() {
  const [user, setUser] = useState(defaultUser);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("organization"); // 'organization' | 'assigned' | 'done'
  const [sortOption, setSortOption] = useState("reported_desc");
  const [delegateMap, setDelegateMap] = useState({}); // Map delegate id to name
  const navigate = useNavigate()

  // Fetch delegates for mapping
  useEffect(() => {
    fetch('/api/v1/delegates/', {
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(r => r.json())
      .then(data => {
        console.log('Fetched delegates from API:', data)
        const fetchedDelegates = Array.isArray(data) ? data : []
        
        // Create a map of id -> name for easy lookup
        const map = {}
        fetchedDelegates.forEach(d => {
          map[d.id] = d.name
        })
        setDelegateMap(map)
      })
      .catch(err => {
        console.error('Error fetching delegates:', err)
      })
  }, [])

  useEffect(() => {
    // set sensible default sort when mode changes
    if (mode === "organization") setSortOption("reported_desc");
    else if (mode === "assigned") setSortOption("priority_desc");
    else if (mode === "done") setSortOption("reported_desc");
  }, [mode]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const u = await getUserData();
        if (!mounted) return;
        setUser(u);

        // fetch incidents from API
        const resp = await fetch("/api/v1/incidents/", {
          headers: {
            'Accept': 'application/json'
          }
        });
        const fetched = await resp.json();
        if (!mounted) return;
        
        const fetchedArray = Array.isArray(fetched) ? fetched : [];
        
        const org = u.organization || "";
        const filtered = fetchedArray.filter((it) => String(it.delegated_to).toLowerCase() === String(org).toLowerCase());
        setTasks(filtered);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Helper function to get delegate name from id
  const getDelegateName = (delegateId) => {
    if (!delegateId) return 'Unassigned'
    return delegateMap[delegateId] || `ID: ${delegateId}`
  }

  return (
    <div>
      <h1 className="d-flex justify-content-center">Open Tasks for: {user.organization}</h1>

      <div className="d-flex justify-content-center">
        <div className="btn-group" role="group" aria-label="task filters" style={{ margin: '1rem 0' }}>
          <button
            type="button"
            className={`btn btn-outline-primary ${mode === "organization" ? "active" : ""}`}
            onClick={() => setMode("organization")}
          >
            Open tasks in my organization
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${mode === "assigned" ? "active" : ""}`}
            onClick={() => setMode("assigned")}
          >
            Assigned (in progress)
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${mode === "done" ? "active" : ""}`}
            onClick={() => setMode("done")}
          >
            Done tasks
          </button>
        </div>
      </div>

      {/* sort control - shown for organization (open tasks) mode */}
      {(mode === "organization" || mode === "assigned" || mode === "done") && (
        <div className="d-flex justify-content-center" style={{ marginTop: '0.5rem' }}>
          <select
            className="form-select form-select-sm"
            style={{ width: '260px' }}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            aria-label="Sort tasks"
          >
            <option value="reported_desc">reported desc</option>
            <option value="priority_desc">priority desc</option>
          </select>
        </div>
      )}

      <div className="d-flex justify-content-center" style={{ marginTop: '1rem' }}>
        {loading && <div>Loading tasks…</div>}
        {error && <div style={{ color: "red" }}>Error: {error}</div>}

        {!loading && !error && (
          (() => {
            const org = (user.organization || "").toString().trim().toLowerCase();
            const byOrg = tasks.filter((it) => (String(it.delegated_to || "")).toLowerCase() === org);

            let displayed = [];
            if (mode === "organization") {
              // open tasks: only status === 'open'
              displayed = byOrg.filter((t) => String(t.status).toLowerCase() === "open");
            } else if (mode === "assigned") {
              // only in_progress
              displayed = byOrg.filter((t) => String(t.status).toLowerCase() === "in_progress");
            } else if (mode === "done") {
              displayed = byOrg.filter((t) => String(t.status).toLowerCase() === "done");
            }

            // apply sorting only for the organization (open tasks) view or whenever a sort option is selected
            const sortByPriorityValue = (p) => {
              if (!p) return 0;
              const map = { high: 3, medium: 2, low: 1 };
              return map[String(p).toLowerCase()] || 0;
            };

            const sortTasks = (arr, option) => {
              const copy = Array.isArray(arr) ? arr.slice() : [];
              switch (option) {
                case "reported_asc":
                  return copy.sort((a, b) => (Date.parse(a.reported_at) || 0) - (Date.parse(b.reported_at) || 0));
                case "reported_desc":
                  return copy.sort((a, b) => (Date.parse(b.reported_at) || 0) - (Date.parse(a.reported_at) || 0));
                case "priority_asc":
                  return copy.sort((a, b) => sortByPriorityValue(a.priority) - sortByPriorityValue(b.priority));
                case "priority_desc":
                  return copy.sort((a, b) => sortByPriorityValue(b.priority) - sortByPriorityValue(a.priority));
                default:
                  return copy;
              }
            };

            displayed = sortTasks(displayed, sortOption);

            if (displayed.length === 0) {
              return <div>No tasks found for the selected filter.</div>;
            }

            return (
              <div className="d-flex flex-column align-items-center" style={{ gap: '1rem', marginBottom: '1rem' }}>
                {displayed.map((t) => (
                  <CCard style={{ width: '36rem' }} key={t.id}>
                    <CCardBody>
                      <CCardTitle>{t.title}</CCardTitle>
                      <CCardSubtitle className="mb-2 text-body-secondary">
                        {(() => {
                          const p = (t.priority || "").toString().toLowerCase();
                          const getColor = (v) => {
                            if (v === "high") return "danger";
                            if (v === "medium") return "warning";
                            if (v === "low") return "info";
                            return "secondary";
                          };
                          return (
                            <CBadge color={getColor(p)} shape="rounded-pill">
                              {t.priority}
                            </CBadge>
                          );
                        })()}
                      </CCardSubtitle>
                      <CCardText style={{ minHeight: '3.5rem' }}>{t.description}</CCardText>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-medium-emphasis">Status: {t.status}</small>
                        <small className="text-medium-emphasis">Reported at: {new Date(t.reported_at).toLocaleString()}</small>
                        <CButton color="link" onClick={() => navigate(`/incidents/${t.id}`)}>View Details</CButton>
                      </div>
                    </CCardBody>
                  </CCard>
                ))}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}

export default Helper;
