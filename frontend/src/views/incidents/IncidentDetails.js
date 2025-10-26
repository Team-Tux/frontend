import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CCard, CCardBody, CCardTitle, CCardText, CButton, CFormInput } from '@coreui/react'

export default function IncidentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [existingImages, setExistingImages] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [delegateMap, setDelegateMap] = useState({}) // Map delegate id to name
  const fileInputRef = useRef(null)

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
    let mounted = true
    setLoading(true)
    setError(null)

    fetch(`/api/v1/incidents/${id}`)
      .then((r) => {
        if (!r.ok) {
          throw new Error('Incident not found')
        }
        return r.json()
      })
      .then((data) => {
        if (!mounted) return
        setIncident(data)
        
        // Fetch existing images for these coordinates if incident found
        if (data) {
          fetchImagesForCoordinates(data.lat, data.lon)
        }
      })
      .catch((err) => {
        console.error(err)
        if (!mounted) return
        setError('Incident not found')
      })
      .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [id])

  const fetchImagesForCoordinates = async (lat, lon) => {
    setLoadingImages(true)
    console.log('🔍 Fetching existing images for coordinates:', { lat, lon })
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/images?lat=${lat}&lon=${lon}`)
      // const images = await response.json()
      
      // Mock existing images with file paths (simulating API response)
      const mockExistingImages = [
        {
          id: 'existing-1',
          name: 'existing_photo_1.jpg',
          filePath: '/uploads/images/photo_1.jpg', // This will come from API
          coords: { lat, lon },
          uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          source: 'existing'
        },
        {
          id: 'existing-2',
          name: 'existing_photo_2.jpg',
          filePath: '/uploads/images/photo_2.jpg', // This will come from API
          coords: { lat, lon },
          uploadedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          source: 'existing'
        }
      ]
      
      console.log('✅ Found existing images:', mockExistingImages.length)
      console.log('Existing images data:', mockExistingImages)
      setExistingImages(mockExistingImages)
      
    } catch (error) {
      console.error('❌ Error fetching images:', error)
      setExistingImages([])
    } finally {
      setLoadingImages(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!incident) return <div>Incident not found</div>

  // Helper function to get delegate name from id
  const getDelegateName = (delegateId) => {
    if (!delegateId) return 'Unassigned'
    return delegateMap[delegateId] || `ID: ${delegateId}`
  }

  const updateStatus = (newStatus) => {
    setIncident((prev) => ({ ...(prev || {}), status: newStatus }))
    
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

  const handleImageUpload = (e) => {
    const files = e.target.files
    console.log('📸 Image upload triggered')
    console.log('Files selected:', files?.length || 0)
    console.log('Incident coordinates:', { lat: incident.lat, lon: incident.lon })
    
    if (!files || files.length === 0) {
      console.log('No files selected')
      return
    }

    Array.from(files).forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      // Create FormData for API upload
      const formData = new FormData()
      formData.append('image', file)
      formData.append('lat', incident.lat)
      formData.append('lon', incident.lon)
      formData.append('incidentId', id)
      
      console.log('TODO: Upload to API endpoint /api/images')
      console.log('FormData prepared:', {
        image: file.name,
        lat: incident.lat,
        lon: incident.lon,
        incidentId: id
      })
      
      // Mock response - in real implementation, this will come from API
      // const response = await fetch('/api/images', {
      //   method: 'POST',
      //   body: formData
      // })
      // const result = await response.json()
      
      // Simulate API response with filePath
      const mockApiResponse = {
        id: Date.now() + index,
        name: file.name,
        filePath: `/uploads/images/${Date.now()}_${file.name}`, // This will come from API
        coords: { lat: incident.lat, lon: incident.lon },
        uploadedAt: new Date().toISOString(),
        source: 'uploaded'
      }
      
      setUploadedImages(prev => [...prev, mockApiResponse])
      console.log('Mock API response:', mockApiResponse)
      console.log('In production, filePath will be returned from API')
    })
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageClick = (image) => {
    console.log('🖼️ Image clicked:', image)
    console.log('Image source:', image.source)
    console.log('File path:', image.filePath)
    console.log('Would open image viewer with URL:', image.filePath)
  }

  const handleImageDelete = (imageId, source) => {
    console.log('🗑️ Delete image:', imageId, 'Source:', source)
    
    if (source === 'uploaded') {
      setUploadedImages(prev => prev.filter(img => img.id !== imageId))
      console.log('TODO: Send DELETE request to API /api/images/' + imageId)
    } else {
      console.log('Cannot delete existing images from this view')
    }
    
    console.log('Image removed from list')
  }

  // Combine existing and uploaded images
  const allImages = [...existingImages, ...uploadedImages]

  return (
    <div className="d-flex flex-column align-items-center">
      <div style={{ marginBottom: '1rem' }}>
        Hier die Map
      </div>
      <CCard style={{ width: '48rem', marginBottom: '2rem' }}>
        <CCardBody>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <CButton color="secondary" size="sm" onClick={() => navigate(-1)}>Back</CButton>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {String(incident.status).toLowerCase() === 'open' && (
                <CButton
                  color="primary"
                  size="sm"
                  onClick={() => updateStatus('in_progress')}
                >
                  Accept
                </CButton>
              )}
              {String(incident.status).toLowerCase() === 'in_progress' && (
                <>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => updateStatus('open')}
                  >
                    Release
                  </CButton>
                  
                  <CButton
                    color="success"
                    size="sm"
                    onClick={() => updateStatus('done')}
                  >
                   Done 
                  </CButton>
                  <CButton
                    color="danger"
                    size="sm"
                   // toDo: call philipps api and show the best way for the ambulance 
                  >
                   Send Ambulance 
                  </CButton>
                </>
              )}
            </div>
          </div>
          <CCardTitle>{incident.title}</CCardTitle>
          <div style={{ marginBottom: '0.5rem', color: 'var(--cui-body-color)' }}><b>Status:</b> {incident.status == "in_progress" ? "In Progress": incident.status}</div>
          <div style={{ marginBottom: '0.5rem', color: 'var(--cui-body-color)' }}><b>Delegated to:</b> {getDelegateName(incident.delegated_to)}</div>
          <div style={{ marginBottom: '0.5rem', color: 'var(--cui-body-color)' }}><b>Priority:</b> {incident.priority}</div>
          <div style={{ marginBottom: '0.5rem', color: 'var(--cui-body-color)' }}><b>Reported at:</b> {incident.reported_at ? new Date(incident.reported_at).toLocaleString() : '—'}</div>
          <CCardText>{incident.description}</CCardText>
          <div style={{ marginTop: '1rem', color: 'var(--cui-body-color)' }}><b>Coordinates:</b> {incident.lat}, {incident.lon}</div>

          {/* Image Section - Only visible when status is in_progress */}
          {String(incident.status).toLowerCase() === 'in_progress' && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--cui-border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h5 style={{ margin: 0 }}>📷 Images for this location</h5>
                <span style={{ fontSize: '0.9rem', color: 'var(--cui-text-secondary)' }}>
                  {existingImages.length} existing • {uploadedImages.length} uploaded
                </span>
              </div>
              
              {/* Upload Button */}
              <div style={{ marginBottom: '1rem' }}>
                <CFormInput
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <CButton 
                  color="primary" 
                  size="sm"
                  onClick={() => {
                    console.log('📤 Upload button clicked')
                    fileInputRef.current?.click()
                  }}
                >
                  Upload New Images
                </CButton>
                <small style={{ marginLeft: '0.5rem', color: 'var(--cui-text-secondary)' }}>
                  Coordinates: {incident.lat}, {incident.lon}
                </small>
              </div>

              {/* Loading State */}
              {loadingImages && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--cui-text-secondary)' }}>
                  Loading existing images...
                </div>
              )}

              {/* Display All Images */}
              {!loadingImages && allImages.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {allImages.map((img) => (
                    <div 
                      key={img.id} 
                      style={{ 
                        border: `2px solid ${img.source === 'existing' ? 'var(--cui-success)' : 'var(--cui-primary)'}`, 
                        borderRadius: '8px', 
                        padding: '1rem',
                        backgroundColor: 'var(--cui-body-bg)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {/* Badge for existing images */}
                      {img.source === 'existing' && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          left: '0.5rem',
                          backgroundColor: 'var(--cui-success)',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          zIndex: 1
                        }}>
                          EXISTING
                        </div>
                      )}
                      
                      <div 
                        onClick={() => handleImageClick(img)}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        <div style={{ 
                          height: '150px', 
                          backgroundColor: 'var(--cui-secondary-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ fontSize: '3rem' }}>
                            {img.source === 'existing' ? '🌍' : '�'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {img.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--cui-text-secondary)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {img.filePath}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cui-text-secondary)' }}>
                          📍 {img.coords.lat}, {img.coords.lon}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cui-text-secondary)' }}>
                          🕒 {new Date(img.uploadedAt).toLocaleString()}
                        </div>
                      </div>
                      
                      {/* Delete button only for uploaded images */}
                      {img.source === 'uploaded' && (
                        <CButton 
                          color="danger" 
                          size="sm" 
                          style={{ width: '100%' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageDelete(img.id, img.source)
                          }}
                        >
                          Delete
                        </CButton>
                      )}
                    </div>
                  ))}
                </div>
              ) : !loadingImages && (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  border: '2px dashed var(--cui-border-color)', 
                  borderRadius: '8px',
                  color: 'var(--cui-text-secondary)'
                }}>
                  No images found for these coordinates. Click "Upload New Images" to add photos.
                </div>
              )}
            </div>
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}
