import axios from "axios"
import { useMutation, useQuery } from "react-query"

export const useIncidents = () => {
    return useQuery(
        'useincidents',
        () => axios.get(`${API_URL}/api/v1/incidents`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
        },
    )
}

export const useIncident = (incidentId) => {
    return useQuery(
        ['useincident', incidentId],
        () => axios.get(`${API_URL}/api/v1/incidents/${incidentId}`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
        },
    )
}

export const useUpdateStatus = () => {
    return useMutation(({ incidentId, newStatus }) => {
        return axios.patch(`${API_URL}/api/v1/incidents/${incidentId}/status?status=${newStatus}`).then((res) => res.data)
    })
}