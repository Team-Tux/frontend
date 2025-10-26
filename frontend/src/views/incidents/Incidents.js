import React, { useEffect, useState, useMemo, useRef } from 'react'
import {
  CTable, CTableBody, CTableHead, CTableHeaderCell,
  CTableRow, CTableDataCell, CCollapse, CDropdown, CDropdownToggle,
  CDropdownMenu, CDropdownItem, CDropdownDivider, CButton, CCol
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'

export default function TableExample() {
  const navigate = useNavigate()
  const [openRow, setOpenRow] = useState(null)
  const [rows, setRows] = useState([])
  const [allDelegates, setAllDelegates] = useState([]) // Store all delegates with {id, name}
  const [delegateMap, setDelegateMap] = useState({}) // Map delegate id to name
  const [incidentImages, setIncidentImages] = useState({}) // Store images for each incident
  const dropdownRefs = useRef({}) // Store refs to dropdowns

  // Fetch delegates from API
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
        setAllDelegates(fetchedDelegates)
        
        // Create a map of id -> name for easy lookup
        const map = {}
        fetchedDelegates.forEach(d => {
          map[d.id] = d.name
        })
        setDelegateMap(map)
        console.log('Delegate map:', map)
      })
      .catch(err => {
        console.error('Error fetching delegates:', err)
      })
  }, [])

  useEffect(() => {
    // Fetch incidents from API (via Vite proxy to avoid CORS)
    fetch('/api/v1/incidents/', {
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(r => {
        console.log('API Response status:', r.status)
        console.log('API Response headers:', r.headers)
        return r.json()
      })
      .then(data => {
        console.log('Fetched incidents from API:', data)
        console.log('Type of data:', typeof data)
        console.log('Is array?', Array.isArray(data))
        
        const fetchedArray = Array.isArray(data) ? data : []
        setRows(fetchedArray)
      })
      .catch(err => {
        console.error('Error fetching incidents:', err)
        setRows([])
      })
  }, [])

  // filter / sort state
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'open' | 'in_progress' | 'done'
  const [delegateFilter, setDelegateFilter] = useState('All') // 'All' or delegate id
  const [orderBy, setOrderBy] = useState('reported') // 'reported' | 'priority' | 'status'

  // Helper function to get delegate name from id
  const getDelegateName = (delegateId) => {
    if (!delegateId) return 'Unassigned'
    return delegateMap[delegateId] || `ID: ${delegateId}`
  }

  const filteredRows = useMemo(() => {
    let res = Array.isArray(rows) ? rows.slice() : []

    if (statusFilter && statusFilter !== 'all') {
      res = res.filter(r => {
        if (statusFilter === 'done') return (r.status === 'done' || r.status === 'closed')
        return r.status === statusFilter
      })
    }

    if (delegateFilter && delegateFilter !== 'All') {
      res = res.filter(r => String(r.delegated_to) === String(delegateFilter))
    }

    // sort
    const prioOrder = { high: 3, medium: 2, low: 1 }
    if (orderBy === 'reported') {
      res.sort((a, b) => new Date(b.reported_at) - new Date(a.reported_at))
    } else if (orderBy === 'priority') {
      res.sort((a, b) => (prioOrder[String(b.priority).toLowerCase()] || 0) - (prioOrder[String(a.priority).toLowerCase()] || 0))
    } else if (orderBy === 'status') {
      // custom status order: open first, then in_progress, then done/closed, then others
      const statusOrder = { open: 0, in_progress: 1, done: 2, closed: 2 }
      res.sort((a, b) => {
        const sa = String(a.status || '').toLowerCase()
        const sb = String(b.status || '').toLowerCase()
        const oa = Object.prototype.hasOwnProperty.call(statusOrder, sa) ? statusOrder[sa] : 99
        const ob = Object.prototype.hasOwnProperty.call(statusOrder, sb) ? statusOrder[sb] : 99
        if (oa !== ob) return oa - ob
        // fallback alphabetical
        return sa.localeCompare(sb)
      })
    }

    return res
  }, [rows, statusFilter, delegateFilter, orderBy])

  const getBg = (s) => {
    if (!s) return undefined
    const key = String(s).toLowerCase()
    if (key === 'high') return 'danger'
    if (key === 'medium') return 'warning'
    if (key === 'low') return 'info'
    if (key === 'closed' || key === 'done') return 'secondary'
    return undefined
  }

  // mark an incident as done
  const markDone = (id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'done' } : r))

    // Send status update to backend (using query parameter)
    fetch(`/api/v1/incidents/${id}/status?status=done`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update status')
      }
      return response.json()
    })
    .then(data => {
      console.log('Successfully updated incident status:', data)
    })
    .catch(error => {
      console.error('Error updating incident status:', error)
    })
  }

  // change status of an incident
  const changeStatus = (id, newStatus) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    
    // Force close dropdown by clicking outside
    setTimeout(() => {
      document.body.click()
    }, 0)
    
    // Send status update to backend (using query parameter)
    fetch(`/api/v1/incidents/${id}/status?status=${newStatus}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update status')
      }
      return response.json()
    })
    .then(data => {
      console.log('Successfully updated incident status:', data)
    })
    .catch(error => {
      console.error('Error updating incident status:', error)
    })
  }

  // delegate an incident to an organization/user
  const delegateTo = (id, delegateId) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, delegated_to: delegateId } : r))
    
    // Force close dropdown by clicking outside
    setTimeout(() => {
      document.body.click()
    }, 0)

    // Send delegation update to backend (using query parameter)
    fetch(`/api/v1/incidents/${id}/delegated_to?delegated_to=${delegateId}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update delegation')
      }
      return response.json()
    })
    .then(data => {
      console.log('Successfully updated incident delegation:', data)
    })
    .catch(error => {
      console.error('Error updating incident delegation:', error)
    })
  }

  // Create a new delegate
  const createNewDelegate = async () => {
    const newDelegateName = prompt("Enter name of new delegate/organization:")
    if (!newDelegateName || !newDelegateName.trim()) {
      return null
    }

    try {
      const response = await fetch('/api/v1/delegates/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newDelegateName.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to create delegate')
      }

      const newDelegate = await response.json()
      console.log('Successfully created new delegate:', newDelegate)
      
      // Update local state with new delegate
      setAllDelegates(prev => [...prev, newDelegate].sort((a, b) => a.name.localeCompare(b.name)))
      setDelegateMap(prev => ({ ...prev, [newDelegate.id]: newDelegate.name }))
      
      return newDelegate.id
    } catch (error) {
      console.error('Error creating new delegate:', error)
      alert('Failed to create new delegate. Please try again.')
      return null
    }
  }

  // Fetch images for a specific incident
  const fetchImagesForIncident = async (incidentId, lat, lon) => {
    console.log('🔍 Fetching images for incident:', incidentId, 'at coordinates:', { lat, lon })
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/images?lat=${lat}&lon=${lon}`)
      // const images = await response.json()
      
      // Mock existing images with file paths (simulating API response)
      const mockExistingImages = [
        {
          id: `${incidentId}-img-1`,
          name: 'photo_1.jpg',
          filePath: '/uploads/images/photo_1.jpg',
          uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: `${incidentId}-img-2`,
          name: 'photo_2.jpg',
          filePath: '/uploads/images/photo_2.jpg',
          uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        }
      ]
      
      console.log('✅ Found images for incident:', incidentId, mockExistingImages.length)
      setIncidentImages(prev => ({ ...prev, [incidentId]: mockExistingImages }))
      
    } catch (error) {
      console.error('❌ Error fetching images:', error)
      setIncidentImages(prev => ({ ...prev, [incidentId]: [] }))
    }
  }

  // Handle row toggle and fetch images if needed
  const handleRowToggle = (incidentId, lat, lon) => {
    const newOpenRow = openRow === incidentId ? null : incidentId
    setOpenRow(newOpenRow)
    
    // Fetch images when opening a row if not already fetched
    if (newOpenRow && !incidentImages[incidentId]) {
      fetchImagesForIncident(incidentId, lat, lon)
    }
  }

  return (
    
    <div>
      
      <div className="controls d-flex flex-wrap gap-3 mb-3 p-3 rounded shadow-sm align-items-end justify-content-between" style={{ backgroundColor: 'var(--cui-body-bg)', border: '1px solid var(--cui-border-color)' }}>
        <div className="d-flex flex-wrap gap-3">
          <div className="block d-flex flex-column me-2">
            <div className="label fw-bold mb-2" style={{ color: 'var(--cui-body-color)' }}>Show incidents with status:</div>
            <div className="btn-row d-flex gap-2">
            {[
              { label: 'All', value: 'all' },
              { label: 'Open', value: 'open' },
              { label: 'In progress', value: 'in_progress' },
              { label: 'Done', value: 'done' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`btn ${statusFilter === opt.value ? 'btn-primary' : 'btn-outline-secondary'} btn-sm`}
              >
                {opt.label}
              </button>
            ))}
            </div>
          </div>




          <div className="block d-flex flex-column">
            <div className="label fw-bold mb-2" style={{ color: 'var(--cui-body-color)' }}>Order by:</div>
            <div className="btn-row d-flex gap-2">
            <button
              type="button"
              onClick={() => setOrderBy('reported')}
              className={`btn ${orderBy === 'reported' ? 'btn-primary' : 'btn-outline-secondary'} btn-sm`}
            >
              Reported date
            </button>
            <button
              type="button"
              onClick={() => setOrderBy('priority')}
              className={`btn ${orderBy === 'priority' ? 'btn-primary' : 'btn-outline-secondary'} btn-sm`}
            >
              Priority
            </button>
            <button
              type="button"
              onClick={() => setOrderBy('status')}
              className={`btn ${orderBy === 'status' ? 'btn-primary' : 'btn-outline-secondary'} btn-sm`}
            >
              Status
            </button>
            </div>
          </div>
          

          <div className="block d-flex flex-column me-2">
            <div className="label fw-bold mb-2" style={{ color: 'var(--cui-body-color)' }}>Delegated to:</div>
            <div className="btn-row">
            <CDropdown>
              <CDropdownToggle color="secondary" className="btn-sm" >
                {delegateFilter === 'All' ? 'All' : getDelegateName(delegateFilter)}
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => setDelegateFilter('All')} active={delegateFilter === 'All'}>
                  All
                </CDropdownItem>
                {allDelegates.map(d => (
                  <CDropdownItem key={d.id} onClick={() => setDelegateFilter(d.id)} active={delegateFilter === d.id}>
                    {d.name}
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
          </div>
        </div>
        </div>

        <div className="block d-flex flex-column">
          <div className="label fw-bold mb-2" style={{ color: 'var(--cui-body-color)' }}>New Incident</div>
          <CButton 
            color="primary" 
            onClick={() => navigate('/incidents/create')}
          >
            + Create New Incident
          </CButton>
        </div>
      </div>

      <div className="overflow-hidden shadow-sm rounded-top" style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px', backgroundColor: 'var(--cui-body-bg)' }}>
  <CTable hover responsive>
  <CTableHead>
        <CTableRow>
          <CTableHeaderCell></CTableHeaderCell>
          <CTableHeaderCell>Title</CTableHeaderCell>
          <CTableHeaderCell>Status</CTableHeaderCell>
          <CTableHeaderCell>Delegated to</CTableHeaderCell>
          <CTableHeaderCell>Priority</CTableHeaderCell>
          <CTableHeaderCell></CTableHeaderCell>
        </CTableRow>
      </CTableHead>

      <CTableBody>
        {filteredRows.map(r => {
          const isOpen = openRow === r.id
          const isDone = r.status === 'closed' || r.status === 'done'
          const commonCellStyle = {
            textDecoration: isDone ? 'line-through' : 'none',
            opacity: isDone ? .6 : 1,
          }

          return (
            <React.Fragment key={r.id}>
              <CTableRow
                onClick={() => handleRowToggle(r.id, r.lat, r.lon)}
                color={getBg(isDone ? 'done' : r.priority)}
                style={{ cursor: 'pointer' }}
              >
                <CTableDataCell style={{ width: 30, ...commonCellStyle }}>
                  <span style={{
                    display: 'inline-block',
                    transition: 'transform .2s',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    opacity: isDone ? .6 : 1
                  }}>▶</span>
                </CTableDataCell>

                <CTableDataCell style={commonCellStyle}>{r.title}</CTableDataCell>
                <CTableDataCell style={{ ...commonCellStyle, textDecoration: 'none' }}>
                  {r.status === 'in_progress' ? 'in progress' : r.status}
                </CTableDataCell>
                <CTableDataCell style={{ ...commonCellStyle, textDecoration: 'none' }}>{getDelegateName(r.delegated_to)}</CTableDataCell>
                <CTableDataCell style={{ ...commonCellStyle, textDecoration: 'none' }}>{r.priority}</CTableDataCell>
                <CTableDataCell style={{ ...commonCellStyle, textDecoration: 'none' }}>
                  <CCol className="d-flex justify-content-center">
                    <CDropdown className='me-2' onClick={(e) => e.stopPropagation()}>
                      <CDropdownToggle 
                        color="secondary"
                        size="sm"
                        disabled={isDone}>
                        Show on map
                      </CDropdownToggle>
                      <CDropdownMenu>
                        <CDropdownItem 
                          href="#" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setTimeout(() => document.body.click(), 0);
                          }}
                        >
                          2D
                        </CDropdownItem>
                        <CDropdownItem 
                          href="#" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setTimeout(() => document.body.click(), 0);
                          }}
                        >
                          3D
                        </CDropdownItem>
                      </CDropdownMenu>
                    </CDropdown>

                    <CDropdown className='me-2' onClick={(e) => e.stopPropagation()}>
                      <CDropdownToggle
                        color="secondary"
                        size="sm"
                        disabled={isDone}>
                        Delegate to
                      </CDropdownToggle>
                      <CDropdownMenu>
                        {allDelegates.map(d => (
                          <CDropdownItem
                            key={d.id}
                            onClick={(e) => {  delegateTo(r.id, d.id); e.stopPropagation(); }}
                            active={d.id === r.delegated_to}
                          >
                            {d.name}
                          </CDropdownItem>
                        ))}
                        <CDropdownDivider />
                        <CDropdownItem
                          onClick={async (e) => {
                            e.stopPropagation();
                            const newDelegateId = await createNewDelegate();
                            if (newDelegateId) {
                              delegateTo(r.id, newDelegateId);
                            }
                          }}
                        >
                          + Add new delegate
                        </CDropdownItem>
                      </CDropdownMenu>
                    </CDropdown>

                    <CDropdown className='me-2' onClick={(e) => e.stopPropagation()}>
                      <CDropdownToggle
                        color="primary"
                        size="sm"
                        disabled={isDone}>
                        Change Status
                      </CDropdownToggle>
                      <CDropdownMenu>
                        <CDropdownItem
                          onClick={(e) => { changeStatus(r.id, 'open'); e.stopPropagation(); }}
                          active={r.status === 'open'}
                        >
                          Open
                        </CDropdownItem>
                        <CDropdownItem
                          onClick={(e) => { changeStatus(r.id, 'in_progress'); e.stopPropagation(); }}
                          active={r.status === 'in_progress'}
                        >
                          In Progress
                        </CDropdownItem>
                      </CDropdownMenu>
                    </CDropdown>

                    <CButton 
                      color={isDone ? "secondary" : "success"} 
                      size="sm"
                      disabled={isDone} 
                      onClick={(e) => { e.stopPropagation(); markDone(r.id); }}
                    >
                      Done
                    </CButton>
                  </CCol>
                </CTableDataCell>
              </CTableRow>

              <CTableRow>
                <CTableDataCell colSpan={6} className="p-0 border-0">
                  <CCollapse visible={isOpen}>
                    <div className="p-3">
                      <div><b>Description:</b> {r.description}</div>
                      <div><b>Delegated to:</b> {getDelegateName(r.delegated_to)}</div>
                      <div><b>Reported:</b> {new Date(r.reported_at).toLocaleString()}</div>
                      <div><b>Coords:</b> {r.lat}, {r.lon}</div>
                      
                      {/* Images Section */}
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--cui-border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <b>📷 Images:</b>
                          {incidentImages[r.id] && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--cui-text-secondary)' }}>
                              {incidentImages[r.id].length} image(s)
                            </span>
                          )}
                        </div>
                        
                        {!incidentImages[r.id] ? (
                          <div style={{ fontSize: '0.9rem', color: 'var(--cui-text-secondary)', fontStyle: 'italic' }}>
                            Loading images...
                          </div>
                        ) : incidentImages[r.id].length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                            {incidentImages[r.id].map((img) => (
                              <div 
                                key={img.id}
                                style={{ 
                                  border: '1px solid var(--cui-border-color)', 
                                  borderRadius: '4px', 
                                  padding: '0.5rem',
                                  backgroundColor: 'var(--cui-secondary-bg)',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  console.log('🖼️ Image clicked:', img)
                                }}
                              >
                                <div style={{ 
                                  height: '80px', 
                                  backgroundColor: 'var(--cui-body-bg)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '4px',
                                  marginBottom: '0.25rem'
                                }}>
                                  <span style={{ fontSize: '2rem' }}>🖼️</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {img.name}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--cui-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {img.filePath}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.9rem', color: 'var(--cui-text-secondary)', fontStyle: 'italic' }}>
                            No images found for this location
                          </div>
                        )}
                        
                        <CButton 
                          color="link" 
                          size="sm"
                          style={{ marginTop: '0.5rem', padding: 0 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/incidents/${r.id}`)
                          }}
                        >
                          View full details →
                        </CButton>
                      </div>
                    </div>
                  </CCollapse>
                </CTableDataCell>
              </CTableRow>
            </React.Fragment>
          )
        })}
      </CTableBody>
    </CTable>
    </div>
    </div>
  )
}
TableExample.displayName = 'TableExample'
