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

export const usePinUpload = () => {
    return useMutation(({ lat, long, img }) => {
        const formData = new FormData()
        formData.append('lat', lat)
        formData.append('long', long)
        formData.append('img', img) 
        return axios.post(`${PIN_API_URL}/api/pins`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => res.data)
    })
}
