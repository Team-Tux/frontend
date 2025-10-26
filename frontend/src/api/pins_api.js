import axios from "axios"
import { useMutation, useQuery } from "react-query"

export const usePins = () => {
    return useQuery(
        'usepins',
        () => axios.get(`${PIN_API_URL}/api/pins`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
        },
    )
}

export const usePinImage = (imageUrl) => {
    return useQuery(
        'usepins',
        () => axios.get(`${PIN_API_URL}${imageUrl}`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
        },
    )
}
