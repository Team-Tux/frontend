import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'

window.API_URL = 'http://192.168.188.23:8000'
window.PIN_API_URL = 'http://aerondight:8080'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
