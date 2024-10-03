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
              <Route path="/muser" element={<ProtectedRoute allowedRoles={['admin', 'user']}><Home/></ProtectedRoute>} />
              <Route path="/duser" element={<ProtectedRoute allowedRoles={['admin', 'user']} ><HomeDefautUser /></ProtectedRoute>} />
              <Route path="/room" element={<ProtectedRoute allowedRoles={['admin', 'user']} ><Room /></ProtectedRoute>} />
              <Route path="/av" element={<ProtectedRoute allowedRoles={['admin', 'user']} ><AvailableSessions /></ProtectedRoute>} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
