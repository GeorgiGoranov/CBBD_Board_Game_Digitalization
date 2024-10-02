const User = require('../models/UsersModel')
const GameSession = require('../models/SessionModel')
const bcrypt = require("bcrypt");
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken");
const { json } = require('express');
const saltRounds = 10;

//create user
const createUser = async (req, res) => {
    const { name, username, email, role, nationality, password } = req.body

    let emptyFields = [];

    if (!name) {
        emptyFields.push("name");
    }
    if (!username) {
        emptyFields.push("username");
    }
    if (!email) {
        emptyFields.push("email");
    }
    if (!role) {
        emptyFields.push("role");
    }
    if (!nationality) {
        emptyFields.push("nationality");
    }
    if (!password) {
        emptyFields.push("password"); 
    }


    if (emptyFields.length > 0) {
        return res
            .status(400)
            .json({ error: "Please fill in all the fields!", emptyFields });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const user = await User.create({ name, username, email, role, nationality, password: hashedPassword })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })

    }

}

//get all users
const getAllUsers = async (req, res) => {
    const allUsers = await User.find({}).sort({ createdAt: -1 })

    res.status(200).json(allUsers)
}

//get a single user
const getUser = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such User in the system!' })

    }

    const user = await User.findById(id)

    if (!user) {
        return res.status(404).json({ error: 'No such User found!' })
    }

    res.status(200).json(user)
}

//delete User
const deleteUser = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such User in the system!' })
    }

    const user = await User.findByIdAndDelete({ _id: id })

    if (!user) {
        return res.status(404).json({ error: 'No such User found!' })
    }

    res.status(200).json(user)
}

//update User
const updateUser = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such User in the system!' })
    }

    const user = await User.findByIdAndUpdate(
        { _id: id },
        { ...req.body, },
        { new: true } // Return the updated document, not the original one
    )

    if (!user) {
        return res.status(404).json({ error: 'No such User found!' })
    }

    res.status(200).json(user)
}

const getUserLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Try to find the user by username or email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
       
        const token = createToken(user._id, user.role);

        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 }); // cookie operates in milisecond and not in minutes

        res.status(200).json({ message: "Login successful", user: {_id: user._id, role: user.role}, token});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a random 6-digit number
};


const createSession = async (req, res) => {
    try {
        const host = req.user.id // Get the host name from the request

        // Generate a unique 6-digit code
        let sessionCode;
        let sessionExists;

        do {
            sessionCode = generateCode();
            sessionExists = await GameSession.findOne({ code: sessionCode })
        } while (sessionExists) // Ensure that the code is unique

        // Create a new game session in the database
        const newSession = new GameSession({
            code: sessionCode,
            host: host,
            players: [],
        });

        await newSession.save();

        res.status(201).json({ code: sessionCode, message: 'Game session created!' });

    } catch (error) {
        res.status(500).json({ message: 'Error creating session' });
    }
}

const joinSession = async (req, res) => {
    try {
        const { code, playerID } = req.body

        const session = await GameSession.findOne({ code });
        if (!session) {
            return res.status(404).json({ message: 'Game session not found!' })
        }
        if (!session.isActive) {
            return res.status(400).json({ message: 'Game session not longer active!' })
        }
        // Add the player to the session's players array if not already present
        if (!session.players.includes(playerID)) {
            session.players.push(playerID)
            await session.save() // Save the updated session

            // Emit the playerJoined event via Socket.io to all connected clients
            const io = req.app.get('io');  // Access io instance
            io.to(code).emit('playerJoined', { playerID, players: session.players });

        }
       return res.status(200).json({ message: 'Player joined the session successfully!', session })

    } catch (error) {
        console.error('Error joining session:', error);
        res.status(500).json({ message: 'Error joining the sesion', session })
    }
}

const maxAge = 3 * 24 * 60 * 60 // time lenght 5 min
const createToken = (id, role)=>{
    return jwt.sign({id,role}, process.env.SECRET_KEY,{
        expiresIn: maxAge
    })
}


const isAuth = (req, res) => {
    const token = req.cookies.jwt

    if(!token){
        return res.status(200).json({authenticated: false})
    }

    jwt.verify(token, process.env.SECRET_KEY, async(error, decodedToken) =>{
        if(error){
            return res.status(200).json({authenticated: false})
        }
        try{
            const user = await User.findById(decodedToken.id).select('-password')
           
            if(!user){
                return res.status(200).json({authenticated:false})
            }
            res.status(200).json({authenticated: true, user})
        }catch(error){
            console.error('Error fetching user: ' , error)
            res.status(500),json({authenticated: false})
        }
    })
}

const logOut = async (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
    createUser,
    getAllUsers,
    getUser,
    deleteUser,
    updateUser,
    getUserLogin,
    createSession,
    joinSession,
    logOut,
    isAuth
}
