import axios from "axios"
import { useQuery } from "react-query"

export const useDelegates = () => {
    return useQuery(
        'usedelegates',
        () => axios.get(`${API_URL}/api/v1/delegates`).then((res) => res.data),
        {
            refetchOnWindowFocus: false,
        },
    )
}
