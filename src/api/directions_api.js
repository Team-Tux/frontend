import axios from "axios";
import { useMutation } from "react-query";

export const useCalculateDirections = () => {
  return useMutation(({ startLat, startLon, endLat, endLon }) => {
    return axios
      .post(`${PIN_API_URL}/api/directions`, {
        start: {
          lat: startLat,
          lon: startLon,
        },
        end: {
          lat: endLat,
          lon: endLon,
        },
      })
      .then((res) => res.data);
  });
};
