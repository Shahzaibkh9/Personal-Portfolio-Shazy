import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import App from './App'
import './styles.css'

// keep transitions time-accurate even when frames are dropped (slow devices / background tabs)
gsap.ticker.lagSmoothing(0)

createRoot(document.getElementById('root')).render(<App />)
