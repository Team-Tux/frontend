import React, { useState, useEffect } from 'react'
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
  CDropdownDivider,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'

export default function CreateIncident() {
  const navigate = useNavigate()
  const [allDelegates, setAllDelegates] = useState([]) // Store all delegates with {id, name}
  const [delegateMap, setDelegateMap] = useState({}) // Map delegate id to name
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    lat: '',
    lon: '',
    delegated_to: '',
  })

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
      })
      .catch(err => {
        console.error('Error fetching delegates:', err)
      })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Create new incident object
    const newIncident = { 
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      lat: parseFloat(formData.lat),
      lon: parseFloat(formData.lon),
      delegated_to: formData.delegated_to || 'Unassigned',
      status: 'open',
      reported_at: new Date().toISOString(),
    }
    
    // Send data to backend
    fetch('/api/v1/incidents/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newIncident),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      console.log('Successfully created incident on backend:', data)
      alert('Incident created successfully!')
      navigate('/incidents')
    })
    .catch(error => {
      console.error('Error creating incident on backend:', error)
      alert('Error creating incident. Please try again.')
    })

    console.log('Creating incident:', newIncident)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Helper function to get delegate name from id
  const getDelegateName = (delegateId) => {
    if (!delegateId) return 'Select Organization'
    return delegateMap[delegateId] || `ID: ${delegateId}`
  }

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
      
      // Set as selected
      setFormData(prev => ({ ...prev, delegated_to: newDelegate.id }))
      setTimeout(() => document.body.click(), 0)
      
      return newDelegate.id
    } catch (error) {
      console.error('Error creating new delegate:', error)
      alert('Failed to create new delegate. Please try again.')
      return null
    }
  }

  const selectDelegate = (delegateId) => {
    setFormData(prev => ({ ...prev, delegated_to: delegateId }))
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
                      {getDelegateName(formData.delegated_to)}
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem onClick={() => selectDelegate('')}>
                        None
                      </CDropdownItem>
                      <CDropdownDivider />
                      {allDelegates.map(d => (
                        <CDropdownItem
                          key={d.id}
                          onClick={() => selectDelegate(d.id)}
                          active={d.id === formData.delegated_to}
                        >
                          {d.name}
                        </CDropdownItem>
                      ))}
                      <CDropdownDivider />
                      <CDropdownItem onClick={createNewDelegate}>
                        + Add new delegate
                      </CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                  {formData.delegated_to && (
                    <span className="text-muted">Selected: <strong>{getDelegateName(formData.delegated_to)}</strong></span>
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
