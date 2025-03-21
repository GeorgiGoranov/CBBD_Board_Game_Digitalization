import { useState, useEffect } from "react"
import '../SCSS/login.scss'
import { useNavigate } from "react-router-dom";
import { useAuth } from '../auth/authContext';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth();
  const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

  // Check if user is already logged in and redirect to home if so
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/muser')
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginSuccess(false)
    setError(null)


    const userLogin = { email, password };


    try {
      const response = await fetch(`${apiUrl}/api/routes/login`, {
        method: 'POST',
        body: JSON.stringify(userLogin),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Ensure cookies are sent with the request
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unknown error');
      } else {
        setEmail('');
        setPassword('');
        setError(null);
        setLoginSuccess(true);

        await login()
        // Navigate based on the role of the logged-in user
       
        if (data.user && data.user.role === 'admin') {
          navigate('/muser');
        } else {
          navigate('/duser');
        }
      }
    } catch (error) {
      setError('An error occurred during login. Please try again. ' + error);
    }

  }

  const joinasParticipant = async (e) => {
      navigate('/duser')
  }


  return (
    <div className="login_container">
      <div className="login_input">
        <h1 className="title" id="login">Login!</h1>
        <form className="login_form" onSubmit={handleLogin}>
          <h3>Email</h3>
          <input
            className='input-login'
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your e-mail"
          />
          <h3>Password</h3>
          <input
            className='input-login'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <button type="submit" className='buttons'>Login</button>
        </form>
        <button onClick={joinasParticipant} className="joinas">Join as Participant</button>
      </div>
      {error && <div className="error">{error}</div>}
      {loginSuccess && <div className="success">Login successful!</div>}
     
    </div>
  );
}

export default Login