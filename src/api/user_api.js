import axios from "axios"
import { useQuery } from "react-query"

export const useMe = () => {
    return useQuery(
        'useme',
        () => axios.get(`${API_URL}/api/v1/users/me`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
        },
    )
}
