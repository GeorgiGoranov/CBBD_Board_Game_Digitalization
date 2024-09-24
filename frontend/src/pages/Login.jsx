import { useState } from "react"
import '../SCSS/login.scss'
import { useNavigate } from "react-router-dom";

const Login = () =>{
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loginSuccess, setLoginSuccess] = useState(false);

    const navigate = useNavigate()

    const handleLogin = async (e) =>{
        e.preventDefault();
        setLoginSuccess(false)
        setError(null)

        const userLogin = { email, password };

        try {
          const response = await fetch('/api/routes/login', {
            method: 'POST',
            body: JSON.stringify(userLogin),
            headers: {
              'Content-Type': 'application/json'
            },
            // credentials: 'include' // Ensure cookies are sent with the request
          });
    
          const data = await response.json();
    
          if (!response.ok) {
            setError(data.error || 'Unknown error');
          } else {
            setEmail('');
            setPassword('');
            setError(null);
            setLoginSuccess(true);
            console.log('User logged in', data);
    
            // // Update the context state
            // await login();
    
            // Navigate based on the role of the logged-in user
            if (data.user && data.user.role === 'admin') {
              navigate('/');
            } else {
              navigate('/');
            }
          }
        } catch (error) {
          setError('An error occurred during login. Please try again.');
        }

    }
    
    return (
        <div className="login_container">
          <div className="login_input">
            <h1 className="title" id="login">Login!</h1>
            <form className="login_form" onSubmit={handleLogin}>
              <h3>Email</h3>
              <input
                className='input'
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <h3>Password</h3>
              <input
                className='input'
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className='buttons'>Login</button>
            </form>
          </div>
          {error && <div className="error">{error}</div>}
          {loginSuccess && <div className="success">Login successful!</div>}
        </div>
      );
}

export default Login