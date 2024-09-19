const UserDetails = ({user}) =>{
    return (
        <div className="user-details">
            <h4>Name: {user.name}</h4>
            <p><strong>Username: </strong>{user.username}</p>
            <p><strong>Email: </strong>{user.email}</p>
            <p><strong>Role: </strong>{user.role}</p>
            <p><strong>Password: </strong>{user.password}</p>
            <p><strong>Created At: </strong>{user.createdAt}</p>

        </div>
    )
}


export default UserDetails