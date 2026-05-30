import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Registration from './pages/Registration'
import Layout from './components/Layout'
import Home from './pages/Home'
import Devices from './pages/Devices'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import TestConnection from './tests/TestConnection'

function App() {
  return (
    <BrowserRouter>
      {/*<TestConnection */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />

        <Route element={<Layout />}>
          <Route path='/home' element={<Home />} />
          <Route path='/devices' element={<Devices />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/settings' element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App