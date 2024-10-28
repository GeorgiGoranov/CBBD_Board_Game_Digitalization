import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/HomeModerator';
import NavBar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import HomeDefautUser from './pages/HomeDefautUser';
import Room from './pages/Room';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './auth/authContext';
import AvailableSessions from "./components/AvailableSessions"
import Cards from "./components/Cards"
import Sheets from "./components/Sheets"
import Additions from './pages/Additions';





function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <NavBar />
          <div className="pages">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/duser" element={<HomeDefautUser />} />
              <Route path="/room/:roomId" element={<Room />} />
              <Route path="/muser" element={<ProtectedRoute allowedRoles={['admin', 'user']}><Home/></ProtectedRoute>} />
              <Route path="/additions" element={<ProtectedRoute allowedRoles={['admin', 'user']} ><Additions/></ProtectedRoute>} />
              {/* component routes below*/}
              <Route path="/av" element={<ProtectedRoute allowedRoles={['admin', 'user']} ><AvailableSessions /></ProtectedRoute>} />
              <Route path="/cards" element={<ProtectedRoute allowedRoles={['admin', 'user']} ><Cards/></ProtectedRoute>} />
              <Route path="/sheets" element={<ProtectedRoute allowedRoles={['admin', 'user']} ><Sheets/></ProtectedRoute>} />
              
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
