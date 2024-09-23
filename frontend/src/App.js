import {BrowserRouter,Routes, Route} from 'react-router-dom'
import Home from './pages/Home';
import NavBar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';

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
          
        </Routes>
       </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
