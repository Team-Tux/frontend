import React, { useEffect, useState } from 'react'
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

  rows.sort((a, b) => new Date(b.reported_at) - new Date(a.reported_at))

  const getBg = (s) => {
    if (!s) return undefined
    const key = String(s).toLowerCase()
    if (key === 'high') return 'danger'
    if (key === 'medium') return 'warning'
    if (key === 'low') return 'info'
    if (key === 'closed' || key === 'done') return 'secondary'
    return undefined
  }

  return (
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
        {rows.map(r => {
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
                    <CDropdown className='me-4'>
                      <CDropdownToggle 
                        color="secondary"
                        disabled={isDone}>Show on map</CDropdownToggle>
                      <CDropdownMenu>
                        <CDropdownItem href="#">2D</CDropdownItem>
                        <CDropdownItem href="#">3D</CDropdownItem>
                      </CDropdownMenu>
                    </CDropdown>

                    <CButton color={isDone ? "secondary" : "success"}disabled={isDone}>Done</CButton>
                  </CCol>
                </CTableDataCell>
              </CTableRow>

              <CTableRow>
                <CTableDataCell colSpan={8} className="p-0 border-0">
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
  )
}
TableExample.displayName = 'TableExample'
