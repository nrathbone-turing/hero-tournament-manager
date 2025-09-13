import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import EventDashboard from "./components/EventDashboard"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/events" element={<EventDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
