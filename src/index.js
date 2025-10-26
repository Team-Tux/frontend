import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'

window.API_URL = 'http://192.168.188.23:8000'
window.PIN_API_URL = 'http://aerondight:8080'
window.SENSOR_API = 'http://192.168.188.21:8080'
window.DIFF_API = 'http://mountain:8080/api/stages/0/{z}/{x}/{y}'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
