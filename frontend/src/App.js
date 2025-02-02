import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ModeratorHomeLayout from './pages/ModeratorHomeLayout';
import NavBar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import ParticipantHomeLayout
  from './pages/ParticipantHomeLayout';
import Room from './pages/Room';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './auth/authContext';
import AvailableSessions from "./components/Moderator/AvailableSessions"

import Additions from './pages/Additions';
import ModeratorRoomLayout from './components/Moderator/ModeratorRoomLayout';
import { LanguageProvider } from './context/LanguageContext';
import Chat from './components/Rooms/Chat';
import Results from './pages/Results'
import Lobby from './pages/Lobby';
import Footer from './components/Footer';



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
                <Route path="/lobby/:roomId" element={<Lobby />} />
                <Route path="/duser" element={<ParticipantHomeLayout />} />
                <Route path="/room/:roomId" element={<Room />} />
                <Route path="/muser" element={<ProtectedRoute allowedRoles={['admin']}><ModeratorHomeLayout /></ProtectedRoute>} />
                <Route path="/additions/:number" element={<ProtectedRoute allowedRoles={['admin']} ><Additions /></ProtectedRoute>} />
                <Route path="/results" element={<ProtectedRoute allowedRoles={['admin']} ><Results /></ProtectedRoute>} />
                {/* component routes below*/}
                <Route path="/av" element={<ProtectedRoute allowedRoles={['admin']} ><AvailableSessions /></ProtectedRoute>} />

                <Route path="/mlayout" element={<ProtectedRoute allowedRoles={['admin']} ><ModeratorRoomLayout /></ProtectedRoute>} />
                <Route path="/chat/:roomId" element={<ProtectedRoute allowedRoles={['admin']} ><Chat /></ProtectedRoute>} />

              </Routes>
            </div>
            <Footer/>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
