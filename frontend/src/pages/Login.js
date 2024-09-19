import { useState } from "react"

const Login = () =>{
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loginSuccess, setLoginSuccess] = useState(false);


    const handleLogin = async (e) =>{
        e.preventDefault();
        setLoginSuccess(false)
        setError(null)
    }
    
    return (
        <div className="login_container">
          <div className="login_input">
            <h1 className="title" id="login">Login!</h1>
            <form className="login_form" onSubmit={handleLogin}>
              <h3>Email / Username</h3>
              <input
                className='input'
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
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