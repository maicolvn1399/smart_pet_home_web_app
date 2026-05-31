import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Registration from './pages/Registration'
import AddPet from './pages/AddPet'
import Layout from './components/Layout'
import Home from './pages/Home'
import Devices from './pages/Devices'
import DeviceDetail from './pages/DeviceDetail'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/add-pet" element={
          <ProtectedRoute>
            <AddPet />
          </ProtectedRoute>
        } />

        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path='/home' element={<Home />} />
          <Route path='/devices' element={<Devices />} />
          <Route path='/devices/:serial' element={<DeviceDetail />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/settings' element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App