import axios from "axios"
import { useQuery } from "react-query"

export const useHelpers = () => {
    return useQuery(
        'useHelpers',
        () => axios.get(`${API_URL}/api/v1/map/helpers`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
        },
    )
}

export const useSensors = () => {
    return useQuery(
        'useSensors',
        () => axios.get(`${API_URL}/api/v1/map/sensors`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
        },
    )
}


export const useVictims = () => {
    return useQuery(
        'useUncidents',
        () => axios.get(`${API_URL}/api/v1/map/victims`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
        },
    )
}

