const User = require('../models/UsersModel')
const bcrypt = require("bcrypt");
const mongoose = require('mongoose')
const saltRounds = 10;

//create user
const createUser = async (req, res) =>{
    const { name, username, email,role,nationality, password } = req.body

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

        const hashedPassword  = await bcrypt.hash(password, saltRounds)
        const user = await User.create({ name, username, email,role,nationality, password: hashedPassword })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })

    }
   
}

//get all users
const getAllUsers = async (req, res) =>{
    const allUsers = await User.find({}).sort({createdAt: -1})

    res.status(200).json(allUsers)
}

//get a single user
const getUser = async (req,res) =>{
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such User in the system!'})

    }

    const user = await User.findById(id)

    if(!user){
        return res.status(404).json({error: 'No such User found!'})
    }

    res.status(200).json(user)
}

//delete User
const deleteUser = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such User in the system!'})
    }

    const user = await User.findByIdAndDelete({_id:id})

    if(!user){
        return res.status(404).json({error: 'No such User found!'})
    }

    res.status(200).json(user)
}

//update User
const updateUser = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such User in the system!'})
    }

    const user = await User.findByIdAndUpdate(
        {_id:id},
        {...req.body,},
        {new: true} // Return the updated document, not the original one
    )

    if(!user){
        return res.status(404).json({error: 'No such User found!'})
    }

    res.status(200).json(user)
}

const getUserLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Try to find the user by username or email
        const user = await User.findOne({email: email });
        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // const token = createToken(user._id, user.role);

        // res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 }); // cookie operates in milisecond and not in minutes

        res.status(200).json({ message: "Login successful", user: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports ={
    createUser,
    getAllUsers,
    getUser,
    deleteUser,
    updateUser,
    getUserLogin
}









