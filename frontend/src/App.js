import {BrowserRouter,Routes, Route} from 'react-router-dom'
import Home from './pages/HomeModerator';
import NavBar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import HomeDefautUser from './pages/HomeDefautUser';
import Room from './pages/Room'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
       <div className="pages">
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/" element={<Home/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/duser" element={<HomeDefautUser/>} />
          <Route path="/room" element={<Room/>} />

          
        </Routes>
       </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
