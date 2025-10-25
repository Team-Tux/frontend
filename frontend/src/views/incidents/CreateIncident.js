import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CButton,
  CRow,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'

export default function CreateIncident() {
  const navigate = useNavigate()
  const [allDelegates, setAllDelegates] = useState([
    'Fire Department',
    'Police',
    'Medical Services',
    'Public Works',
    'Environmental Agency',
  ])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    lat: '',
    lon: '',
    delegated_to: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Create new incident object
    const newIncident = {
      id: Date.now(), // Simple ID generation
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      lat: parseFloat(formData.lat),
      lon: parseFloat(formData.lon),
      delegated_to: formData.delegated_to || 'Unassigned',
      status: 'open',
      reported_at: new Date().toISOString(),
    }
    
    // Get existing incidents from localStorage
    const existingIncidents = JSON.parse(localStorage.getItem('incidents') || '[]')
    
    // Add new incident
    const updatedIncidents = [newIncident, ...existingIncidents]
    
    // Save to localStorage
    localStorage.setItem('incidents', JSON.stringify(updatedIncidents))
    
    // TODO: Send data to backend
    console.log('Creating incident:', newIncident)
    
    alert('Incident created successfully!')
    navigate('/incidents')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addNewDelegate = () => {
    const newDelegate = prompt("Enter name of new delegate/organization:")
    if (newDelegate && newDelegate.trim()) {
      const trimmedDelegate = newDelegate.trim()
      // Add to delegates list if not already present
      if (!allDelegates.includes(trimmedDelegate)) {
        setAllDelegates(prev => [...prev, trimmedDelegate].sort())
      }
      // Set as selected
      setFormData(prev => ({ ...prev, delegated_to: trimmedDelegate }))
      setTimeout(() => document.body.click(), 0)
    }
  }

  const selectDelegate = (delegate) => {
    setFormData(prev => ({ ...prev, delegated_to: delegate }))
    setTimeout(() => document.body.click(), 0)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Create New Incident</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="title">Title</CFormLabel>
                <CFormInput
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter incident title"
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="description">Description</CFormLabel>
                <CFormTextarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Enter incident description"
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="priority">Priority</CFormLabel>
                <CFormSelect
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </CFormSelect>
              </div>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="lat">Latitude</CFormLabel>
                    <CFormInput
                      type="number"
                      step="any"
                      id="lat"
                      name="lat"
                      value={formData.lat}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 48.137154"
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="lon">Longitude</CFormLabel>
                    <CFormInput
                      type="number"
                      step="any"
                      id="lon"
                      name="lon"
                      value={formData.lon}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 11.576124"
                    />
                  </div>
                </CCol>
              </CRow>

              <div className="mb-3">
                <CFormLabel>Delegate To (Optional)</CFormLabel>
                <div className="d-flex gap-2 align-items-center">
                  <CDropdown>
                    <CDropdownToggle color="secondary">
                      {formData.delegated_to || 'Select Organization'}
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem onClick={() => selectDelegate('')}>
                        None
                      </CDropdownItem>
                      <CDropdownItem divider />
                      {allDelegates.map(d => (
                        <CDropdownItem
                          key={d}
                          onClick={() => selectDelegate(d)}
                          active={d === formData.delegated_to}
                        >
                          {d}
                        </CDropdownItem>
                      ))}
                      <CDropdownItem divider />
                      <CDropdownItem onClick={addNewDelegate}>
                        + Add new delegate
                      </CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                  {formData.delegated_to && (
                    <span className="text-muted">Selected: <strong>{formData.delegated_to}</strong></span>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2">
                <CButton type="submit" color="primary">
                  Create Incident
                </CButton>
                <CButton 
                  type="button" 
                  color="secondary"
                  onClick={() => navigate('/incidents')}
                >
                  Cancel
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

CreateIncident.displayName = 'CreateIncident'
