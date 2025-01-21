import React, { useState } from 'react'; // Import useState from React
import "../SCSS/register.scss"


const Register = () => {

    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    const [nationality, setNationality] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    
    const [registrySuccess, setRegistrySuccess] = useState(false);
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

    

    const handleRegistry = async (e) => {
        e.preventDefault()
        setRegistrySuccess(false); // Reset login success on new submission
        setError(null); // Reset error state on new submission

        const user = { name, username, email, role,nationality, password }

        const response = await fetch(`${apiUrl}/api/routes/register`, {
            method: 'POST',
            body: JSON.stringify(user),
            credentials: 'include', // Include JWT cookies
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const json = await response.json()

        if (!response.ok) {
            setError(json.error)
        }
        if (response.ok) {
            setName('')
            setUsername('')
            setEmail('')
            setRole('')
            setNationality('')
            setPassword('')
            setRegistrySuccess(true);
            setError(null)
            console.log('new user added', json)
        }
    }

    return (
        <section className="registry">
            <div className="registry_container">
                    <h1 className="title" id="registry">Register</h1>
                    <form className="registry_form" onSubmit={handleRegistry}>
                        <h3>Name</h3>
                        <input className="input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}></input>
                        <h3>Email</h3>
                        <input className="input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}></input>

                        <h3>Username</h3>
                        <input className="input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}></input>
                        <h3>Nationality</h3>
                        <select
                            className="input"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            placeholder="Select a Nationality">
                            <option value="" disabled>Select a Nationality</option>
                            <option value="german">German</option>
                            <option value="dutch">Dutch</option>
                        </select>
                        <h3>Password</h3>
                        <input className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}></input>

                        <h3>Role</h3>
                        <select
                            className="input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Select a Role">
                            <option value="" disabled>Select a role</option>
                            <option value="user">User</option>
                            <option value="admin">Moderator</option>
                        </select>

                        <br></br>
                        
                        <div className="button-container">

                        <button type="submit" className='buttons'>Register</button>
                        </div>

                    </form>
            </div>
            {error && <div className="error">{error}</div>}
            {registrySuccess && <div className="success">Registry successful!</div>}
        </section>
    )
}

export default Register