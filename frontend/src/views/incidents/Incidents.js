import React, { useEffect, useState, useMemo } from 'react'
import {
  CTable, CTableBody, CTableHead, CTableHeaderCell,
  CTableRow, CTableDataCell, CCollapse, CDropdown, CDropdownToggle,
  CDropdownMenu, CDropdownItem, CButton, CCol
} from '@coreui/react'

export default function TableExample() {
  const [openRow, setOpenRow] = useState(null)
  const [rows, setRows] = useState([])

  useEffect(() => {
    fetch('/incidents.json')
      .then(r => r.json())
      .then(data => setRows(data))
      .catch(err => console.error('Error fetching incidents:', err))
  }, [])

  // filter / sort state
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'open' | 'in_progress' | 'done'
  const [delegateFilter, setDelegateFilter] = useState('All') // 'All' or delegated_to value
  const [orderBy, setOrderBy] = useState('reported') // 'reported' | 'priority' | 'status'

  // derived lists
  const delegates = useMemo(() => {
    const list = Array.from(new Set(rows.map(r => r.delegated_to).filter(Boolean)))
    return ['All', ...list]
  }, [rows])

  const filteredRows = useMemo(() => {
    let res = Array.isArray(rows) ? rows.slice() : []

    if (statusFilter && statusFilter !== 'all') {
      res = res.filter(r => {
        if (statusFilter === 'done') return (r.status === 'done' || r.status === 'closed')
        return r.status === statusFilter
      })
    }

    if (delegateFilter && delegateFilter !== 'All') {
      res = res.filter(r => r.delegated_to === delegateFilter)
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

    // fetch done incidents into the backend
  }

  // delegate an incident to an organization/user
  const delegateTo = (id, delegated) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, delegated_to: delegated } : r))

    // fetch delegation into the backend
  }

  return (
    
    <div>
      
      <div className="controls d-flex flex-wrap gap-3 mb-3 p-3 bg-light rounded shadow-sm">
        <div className="block d-flex flex-column me-2">
          <div className="label fw-bold mb-2">Show incidents with status:</div>
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
          <div className="label fw-bold mb-2">Order by:</div>
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
          <div className="label fw-bold mb-2">Delegated to:</div>
          <div className="btn-row">
            <CDropdown>
              <CDropdownToggle color="secondary" className="btn-sm" >
                {delegateFilter}
              </CDropdownToggle>
              <CDropdownMenu>
                {delegates.map(d => (
                  <CDropdownItem key={d} onClick={() => setDelegateFilter(d)} active={delegateFilter === d}>
                    {d}
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
          </div>
        </div>
      </div>

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
                onClick={() => setOpenRow(isOpen ? null : r.id)}
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
                <CTableDataCell style={commonCellStyle}>
                  {r.status === 'in_progress' ? 'in progress' : r.status}
                </CTableDataCell>
                <CTableDataCell style={commonCellStyle}>{r.delegated_to}</CTableDataCell>
                <CTableDataCell style={commonCellStyle}>{r.priority}</CTableDataCell>
                <CTableDataCell style={commonCellStyle}>
                  <CCol className="d-flex justify-content-center">
                    <CDropdown className='me-3' onClick={(e) => e.stopPropagation()}>
                      <CDropdownToggle 
                        color="secondary"
                        disabled={isDone}>
                        Show on map
                      </CDropdownToggle>
                      <CDropdownMenu>
                        <CDropdownItem href="#" onClick={(e) => e.stopPropagation()}>2D</CDropdownItem>
                        <CDropdownItem href="#" onClick={(e) => e.stopPropagation()}>3D</CDropdownItem>
                      </CDropdownMenu>
                    </CDropdown>

                    <CDropdown className='me-3' onClick={(e) => e.stopPropagation()}>
                      <CDropdownToggle
                        color="secondary"
                        disabled={isDone}>
                        Delegate at
                      </CDropdownToggle>
                      <CDropdownMenu>
                        {delegates.filter(d => d !== 'All').map(d => (
                          <CDropdownItem
                            key={d}
                            onClick={(e) => { e.stopPropagation(); delegateTo(r.id, d); }}
                          >
                            {d}
                          </CDropdownItem>
                        ))}
                      </CDropdownMenu>
                    </CDropdown>

                    <CButton color={isDone ? "secondary" : "success"} disabled={isDone} onClick={(e) => { e.stopPropagation(); markDone(r.id); }}>Done</CButton>
                  </CCol>
                </CTableDataCell>
              </CTableRow>

              <CTableRow>
                <CTableDataCell colSpan={6} className="p-0 border-0">
                  <CCollapse visible={isOpen}>
                    <div className="p-3">
                      <div><b>Description:</b> {r.description}</div>
                      <div><b>Delegated to:</b> {r.delegated_to}</div>
                      <div><b>Reported:</b> {new Date(r.reported_at).toLocaleString()}</div>
                      <div><b>Coords:</b> {r.lat}, {r.lon}</div>
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
  )
}
TableExample.displayName = 'TableExample'
