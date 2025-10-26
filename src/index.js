import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'

const API_URL = import.meta.env.VITE_BACKEND_IP
window.API_URL = API_URL
window.PIN_API_URL = API_URL
window.SENSOR_API = API_URL
window.DIFF_API = `${API_URL}/api/stages/0/{z}/{x}/{y}`

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
