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
import ModeratorRoomLayout from './components/ModeratorRoomLayout';
import { LanguageProvider } from './context/LanguageContext';
import Chat from './components/Chat';





function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>

            <NavBar />
            <div className="pages">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/duser" element={<HomeDefautUser />} />
                <Route path="/room/:roomId" element={<Room />} />
                <Route path="/muser" element={<ProtectedRoute allowedRoles={['admin']}><Home /></ProtectedRoute>} />
                <Route path="/additions" element={<ProtectedRoute allowedRoles={['admin']} ><Additions /></ProtectedRoute>} />
                {/* component routes below*/}
                <Route path="/av" element={<ProtectedRoute allowedRoles={['admin']} ><AvailableSessions /></ProtectedRoute>} />
                <Route path="/cards" element={<ProtectedRoute allowedRoles={['admin']} ><Cards /></ProtectedRoute>} />
                <Route path="/sheets" element={<ProtectedRoute allowedRoles={['admin']} ><Sheets /></ProtectedRoute>} />
                <Route path="/mlayout" element={<ProtectedRoute allowedRoles={['admin']} ><ModeratorRoomLayout /></ProtectedRoute>} />
                <Route path="/chat/:roomId" element={<ProtectedRoute allowedRoles={['admin']} ><Chat /></ProtectedRoute>} />

              </Routes>
            </div>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
