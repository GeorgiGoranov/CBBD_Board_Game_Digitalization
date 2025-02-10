const User = require('../models/UsersModel')
const SessionModel = require('../models/SessionModel')

const bcrypt = require("bcrypt");
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken");
const { json } = require('express');
const saltRounds = 10;

//create user
const createUser = async (req, res) => {
    const { name, username, email, role, password } = req.body

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
        const user = await User.create({ name, username, email, role, password: hashedPassword })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })

    }

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


        const token = createToken(user._id, user.role, user.username, user.nationality);

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: maxAge * 1000,
            path: '/',
        }); // cookie operates in milisecond and not in minutes

        res.status(200).json({ message: "Login successful", user: { _id: user._id, role: user.role }, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const maxAge = 3 * 60 * 60 // time lenght 5 min
const createToken = (id, role, name, nationality, sessionCode) => {

    return jwt.sign({ id, role, name, nationality, sessionCode }, process.env.SECRET_KEY, {
        expiresIn: maxAge
    })
}

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a random 6-digit number
};


const createSession = async (req, res) => {
    try {
        const host = req.user.name // Get the host name from the request

        // Generate a unique 6-digit code
        let sessionCode;
        let sessionExists;

        do {
            sessionCode = generateCode();
            sessionExists = await SessionModel.findOne({ code: sessionCode })
        } while (sessionExists) // Ensure that the code is unique

        // Create a new game session in the database
        const newSession = new SessionModel({
            code: sessionCode,
            host: host,
            players: [],
        });

        await newSession.save();
        /*adding the additional values the responce so that 
        when the web context/hook is triggered can take the unfo
         and filled in without having to make a call to the DB
        */
        res.status(201).json({ code: sessionCode, host: host, isActive: true, message: 'Game session created!' });

    } catch (error) {
        res.status(500).json({ message: 'Error creating session' });
    }
}

const joinGameSession = async (req, res) => {
    try {
        const { roomId, groupedPlayers } = req.body;

        // Find the game session by roomId
        const session = await SessionModel.findOne({ code: roomId });

        if (!session) {
            return res.status(404).json({ message: 'Game session not found!' });
        }

        // Clear existing players
        session.players = [];

        // Add grouped players to the session
        groupedPlayers.forEach((group) => {
            group.players.forEach((player) => {
                session.players.push({
                    name: player.name,
                    nationality: player.nationality,
                    group: group.groupNumber, // Assign group number
                });
            });
        });

        await session.save(); // Save the updated session

        return res.status(200).json({ message: 'Groups saved successfully!' });
    } catch (error) {
        console.error('Error saving groups:', error);
        res.status(500).json({ message: 'Failed to save groups.' });
    }
}

const joinLobbySession = async (req, res) => {
    try {
        const { code, playerUsername, nationality } = req.body

        // Find the game session by roomId
        const session = await SessionModel.findOne({ code });

        if (!session) {
            return res.status(404).json({ message: 'Game session not found!' });
        }

        const token = createToken(generateObjectIdForParticipants(), 'user', playerUsername, nationality, code);


        res.cookie("jwt", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: maxAge * 1000,
            path: '/',
        }); // cookie operates in milisecond and not in minutes

        return res.status(200).json({ message: 'Player joined the session successfully!' })

    } catch (error) {
        console.error('Error joining session:', error);
        res.status(500).json({ message: 'Error joining the sesion', session })
    }
}

const updateTokenGroup = async (req, res) => {
    try {
        const { code, playerUsername, nationality, role, group } = req.body

        console.warn(code + "+" + playerUsername + "+" + nationality + "+" + role + "+" + group)

        if (role != 'admin') {
            const token = updateeToken(generateObjectIdForParticipants(), 'user', playerUsername, nationality, code, group);

            res.cookie("jwt", token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: maxAge * 1000,
                path: '/',
            }); // cookie operates in milisecond and not in minutes
        }

        return res.status(200).json({ message: 'newToken' })

    } catch (error) {
        console.error('Error joining session:', error);
        res.status(500).json({ message: 'Error joining the sesion', session })
    }
}

const updateeToken = (id, role, name, nationality, sessionCode, group) => {

    return jwt.sign({ id, role, name, nationality, sessionCode, group }, process.env.SECRET_KEY, {
        expiresIn: maxAge
    })
}

const generateObjectIdForParticipants = () => {

    const hexChars = "abcdef0123456789";
    let objectId = "";

    for (let i = 0; i < 24; i++) {
        objectId += hexChars[Math.floor(Math.random() * hexChars.length)];
    }

    return objectId;

}

const isAuth = (req, res, next) => {

    const token = req.cookies.jwt;

    if (!token) {
        return res.status(200).json({ authenticated: false, message: "Token is missing or invalid" });
    }

    jwt.verify(token, process.env.SECRET_KEY, async (error, decodedToken) => {
        if (error) {
            console.error('JWT verification error:', error.message);
            return res.status(200).json({ authenticated: false });
        }

        // Validate the decodedToken.id to ensure it's a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(decodedToken.id)) {
            console.warn("Invalid object name!", decodedToken.id);
            return res.status(200).json({ authenticated: false, error: "Invalid user ID" });
        }

        try {
            const user = await User.findById(decodedToken.id).select('-password');

            if (!user) {
                return res.status(200).json({ authenticated: false });
            }

            req.user = {
                id: user._id,
                role: user.role,
                name: user.name,
            };

            if (user.role === 'admin') {
                return res.status(200).json({ authenticated: true, user: req.user });
            }
            // Include sessionCode only if it's provided in the token
            if (decodedToken.sessionCode) {
                req.user.sessionCode = decodedToken.sessionCode;
            }

            next();
            // res.status(200).json({ authenticated: true, user })
        } catch (error) {
            console.error('Error fetching user: ', error);
            res.status(500).json({ authenticated: false });
        }
    });
};

const logOut = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 0,
        path: '/',
    });
    res.status(200).json({ message: "Logged out successfully" });
};
//get all users
const getAllAvailableSessions = async (req, res) => {
    try {
        const allSessions = await SessionModel.find({}).sort({ createdAt: -1 });
        if (allSessions.length === 0) {
            return res.status(200).json({ message: 'No available sessions yet' }); // Return message for no sessions
        }
        res.status(200).json(allSessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Error fetching available sessions', error: error.message });
    }
};

const fetchPlayers = async (req, res) => {
    const { sessionCode } = req.params;

    try {
        // Find the game session by its unique 6-digit code
        const session = await SessionModel.findOne({ code: sessionCode });

        // If no session is found, return an error response
        if (!session) {
            return res.status(404).json({ message: 'Game session not found!' });
        }

        // Return the players array from the found session
        return res.status(200).json({ players: session.players });
    } catch (error) {
        console.error('Error fetching players from session:', error);
        res.status(500).json({ message: 'Error fetching players from session', error: error.message });
    }
}

// DELETE session by ID
const deleteSession = async (req, res) => {
    const { code } = req.params;

    if (!code) {
        return res.status(400).json({ error: 'Session code is missing' });
    }

    try {
        // Attempt to find and delete the session by code
        const session = await SessionModel.findOneAndDelete({ code: code });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error during session deletion:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
};

const userRole = async (req, res) => {
    const { id, role, name, nationality, sessionCode } = req.user;
    res.status(200).json({ id, role, name, nationality, sessionCode });
}

const userRoleUpdated = async (req, res) => {
    const { id, role, name, nationality, sessionCode, group } = req.user;
    res.status(200).json({ id, role, name, nationality, sessionCode, group });
}

const toggleActivity = async (req, res) => {
    try {
        const session = await SessionModel.findOne({ code: req.params.code });
        if (!session) return res.status(404).json({ message: 'Session not found' });

        session.isActive = !session.isActive; // Toggle the isActive status
        await session.save();

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling session activity', error: error.message });
    }
}

module.exports = {
    createUser,
    getAllAvailableSessions,
    getUser,
    // deleteUser,
    updateUser,
    getUserLogin,
    createSession,
    joinGameSession,
    logOut,
    isAuth,
    fetchPlayers,
    deleteSession,
    userRole,
    toggleActivity,
    generateObjectIdForParticipants,
    joinLobbySession,
    updateTokenGroup,
    userRoleUpdated
}
