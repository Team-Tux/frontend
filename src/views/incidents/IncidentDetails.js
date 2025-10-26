import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CButton,
  CFormInput,
} from "@coreui/react";
import { useDelegates } from "../../api/delegates_api";
import { useIncident, useUpdateStatus } from "../../api/incidents_api";
import { usePins, usePinUpload } from "../../api/pins_api";
import TwoD from "../2d/twoD";
import { useCalculateDirections } from "../../api/directions_api";

const rescueStation = {
  lat: 50.546915949525875,
  lon: 9.70607041886039
}

const IncidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { data: delegates } = useDelegates();
  const { data: incident } = useIncident(id);
  const { data: updateStatusResponse, mutate: updateStatus } =
    useUpdateStatus();

  const { data: pins, refetch: reloadPins } = usePins();
  const { data: uploadPinRespose, mutate: uploadPin } = usePinUpload();
  const { data: calculateDirectionsResponse, mutate: calculateDirections } = useCalculateDirections()

  const handleImageUpload = (e) => {
    const files = e.target.files;
    console.log("📸 Image upload triggered");
    console.log("Files selected:", files?.length || 0);
    console.log("Incident coordinates:", {
      lat: incident.lat,
      lon: incident.lon,
    });

    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }

    Array.from(files).forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Create FormData for API upload
      const formData = new FormData();
      formData.append("image", file);
      formData.append("lat", incident.lat);
      formData.append("lon", incident.lon);
      formData.append("incidentId", id);

      console.log("TODO: Upload to API endpoint /api/images");
      console.log("FormData prepared:", {
        image: file,
        lat: incident.lat,
        lon: incident.lon,
        incidentId: id,
      });

      uploadPin({lat: incident.lat, long: incident.lon, img: file});
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageClick = (image) => {
    console.log("🖼️ Image clicked:", image);
    console.log("Image source:", image.source);
    console.log("File path:", image.filePath);
    console.log("Would open image viewer with URL:", image.filePath);
  };

  const handleImageDelete = (imageId, source) => {
    console.log("🗑️ Delete image:", imageId, "Source:", source);

    if (source === "uploaded") {
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
      console.log("TODO: Send DELETE request to API /api/images/" + imageId);
    } else {
      console.log("Cannot delete existing images from this view");
    }

    console.log("Image removed from list");
  };

  useEffect(() => {
    if (updateStatusResponse === undefined) return;

    if (updateStatusResponse.status == "done") navigate("/helper");
  }, [updateStatusResponse]);

  useEffect(() => {
    if (uploadPinRespose === undefined) return;

    reloadPins()
    
  }, [uploadPinRespose]);

  useEffect(()=>{
    if(calculateDirectionsResponse===undefined) return

    console.log("calculateDirectionsResponse", calculateDirectionsResponse);
    
  }, [calculateDirectionsResponse])

  if (incident === undefined || delegates === undefined) return "Loading...";

  const delegatedName = delegates.find(
    (delegate) => delegate.id === incident.delegated_to,
  ).name;

  return (
    <div className="d-flex flex-column align-items-center">
      <div style={{ marginBottom: "1rem", width: "100%", height: "40vh" }}>
        <TwoD
          canShowButtons={false}
          containerHeight="100%"
          initialCoords={[incident.lon, incident.lat]}
          route = {calculateDirectionsResponse}
        />
      </div>
      <CCard style={{ width: "48rem", marginBottom: "2rem" }}>
        <CCardBody>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <CButton color="secondary" size="sm" onClick={() => navigate(-1)}>
              Back
            </CButton>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {String(incident.status).toLowerCase() === "open" && (
                <CButton
                  color="primary"
                  size="sm"
                  onClick={() =>
                    updateStatus({ incidentId: id, newStatus: "in_progress" })
                  }
                >
                  Accept
                </CButton>
              )}
              {String(incident.status).toLowerCase() === "in_progress" && (
                <>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() =>
                      updateStatus({ incidentId: id, newStatus: "open" })
                    }
                  >
                    Release
                  </CButton>

                  <CButton
                    color="success"
                    size="sm"
                    onClick={() =>
                      updateStatus({ incidentId: id, newStatus: "done" })
                    }
                  >
                    Done
                  </CButton>
                  <CButton
                    color="danger"
                    size="sm"
                    // toDo: call philipps api and show the best way for the ambulance
                    onClick={()=>calculateDirections({startLat: rescueStation.lat, startLon: rescueStation.lon, endLat: incident.lat, endLon: incident.lon})}
                  >
                    Send Ambulance
                  </CButton>
                </>
              )}
            </div>
          </div>
          <CCardTitle>{incident.title}</CCardTitle>
          <div
            style={{ marginBottom: "0.5rem", color: "var(--cui-body-color)" }}
          >
            <b>Status:</b>{" "}
            {incident.status == "in_progress" ? "In Progress" : incident.status}
          </div>
          <div
            style={{ marginBottom: "0.5rem", color: "var(--cui-body-color)" }}
          >
            <b>Delegated to:</b> {delegatedName}
          </div>
          <div
            style={{ marginBottom: "0.5rem", color: "var(--cui-body-color)" }}
          >
            <b>Priority:</b> {incident.priority}
          </div>
          <div
            style={{ marginBottom: "0.5rem", color: "var(--cui-body-color)" }}
          >
            <b>Reported at:</b>{" "}
            {incident.reported_at
              ? new Date(incident.reported_at).toLocaleString()
              : "—"}
          </div>
          <CCardText>{incident.description}</CCardText>
          <div style={{ marginTop: "1rem", color: "var(--cui-body-color)" }}>
            <b>Coordinates:</b> {incident.lat}, {incident.lon}
          </div>

          {/* Image Section - Only visible when status is in_progress */}
          {String(incident.status).toLowerCase() === "in_progress" && (
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid var(--cui-border-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h5 style={{ margin: 0 }}>📷 Images for this location</h5>
              </div>

              {/* Upload Button */}
              <div style={{ marginBottom: "1rem" }}>
                <CFormInput
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <CButton
                  color="primary"
                  size="sm"
                  onClick={() => {
                    console.log("📤 Upload button clicked");
                    fileInputRef.current?.click();
                  }}
                >
                  Upload New Images
                </CButton>
                <small
                  style={{
                    marginLeft: "0.5rem",
                    color: "var(--cui-text-secondary)",
                  }}
                >
                  Coordinates: {incident.lat}, {incident.lon}
                </small>
              </div>

              {/* Loading State */}
              {pins === undefined && (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--cui-text-secondary)",
                  }}
                >
                  Loading existing images...
                </div>
              )}

              {/* Display All Images */}
              {pins !== undefined ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {pins.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        border: `2px solid ${img.source === "existing" ? "var(--cui-success)" : "var(--cui-primary)"}`,
                        borderRadius: "8px",
                        padding: "1rem",
                        backgroundColor: "var(--cui-body-bg)",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        position: "relative",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.02)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      {/* Badge for existing images */}
                      {img.source === "existing" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "0.5rem",
                            left: "0.5rem",
                            backgroundColor: "var(--cui-success)",
                            color: "white",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            zIndex: 1,
                          }}
                        >
                          EXISTING
                        </div>
                      )}

                      <div
                        onClick={() => handleImageClick(img)}
                        style={{ marginBottom: "0.5rem" }}
                      >
                        <div
                          style={{
                            height: "150px",
                            backgroundColor: "var(--cui-secondary-bg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span style={{ fontSize: "3rem" }}>
                            {/* {img.source === 'existing' ? '🌍' : '�'} */}
                            <img
                              src={`${window.PIN_API_URL}${img.image_url}`}
                              width="100%"
                              height="100%"
                            />
                          </span>
                        </div>
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                            marginBottom: "0.25rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {img.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--cui-text-secondary)",
                            marginBottom: "0.25rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {img.filePath}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--cui-text-secondary)",
                          }}
                        >
                          📍 {img.lat}, {img.lon}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--cui-text-secondary)",
                          }}
                        >
                          🕒 {new Date(img.created_at).toLocaleString()}
                        </div>
                      </div>

                      {/* Delete button only for uploaded images */}
                      {img.source === "uploaded" && (
                        <CButton
                          color="danger"
                          size="sm"
                          style={{ width: "100%" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageDelete(img.id, img.source);
                          }}
                        >
                          Delete
                        </CButton>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    border: "2px dashed var(--cui-border-color)",
                    borderRadius: "8px",
                    color: "var(--cui-text-secondary)",
                  }}
                >
                  No images found for these coordinates. Click "Upload New
                  Images" to add photos.
                </div>
              )}
            </div>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default IncidentDetails;
