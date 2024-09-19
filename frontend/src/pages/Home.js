import { useEffect, useState } from "react"
import UserDetails from "../components/UserDetails"


const Home = () =>{
    const [users, setUsers] = useState(null)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/routes/')
    
                if (!response.ok) {
                    // Handle the HTTP error response (status not 2xx)
                    console.error(`HTTP error! status: ${response.status}`);
                    return;
                }
    
                const json = await response.json();
                setUsers(json);
            } catch (error) {
                // Handle network errors or other errors here
                console.error('Fetch error:', error);
            }
        }
    
        fetchUsers();
    }, []);
    


    return (
        <div className="home">
            <h2>Home</h2>
            <div className="users">
                {users && users.map((user) =>(
                  <UserDetails key={user._id} user ={user} />
                ))}
            </div>
        </div>
    )
}


export default Home