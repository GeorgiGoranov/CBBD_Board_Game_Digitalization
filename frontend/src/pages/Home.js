import { useEffect, useState } from "react"
import UserDetails from "../components/UserDetails"
import { useUsersContext } from "../hooks/useUsersContext";


const Home = () => {
    const { users, dispatch } = useUsersContext()

    useEffect(() => {
        const fetchUsers = async () => {

            const response = await fetch('/api/routes/')
            const json = await response.json();

            if (response.ok) {
                dispatch({type: 'SET_USERS', payload: json})
            }


        }

        fetchUsers();
    }, []);



    return (
        <div className="home">
            <h2>Home</h2>
            <div className="users">
                {users && users.map((user) => (
                    <UserDetails key={user._id} user={user} />
                ))}
            </div>
        </div>
    )
}


export default Home