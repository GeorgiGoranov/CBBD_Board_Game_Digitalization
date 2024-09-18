const User = require('../models/UsersModel')

const mongoose = require('mongoose')


//create user
const createUser = async (req, res) =>{
    const { name, username, email,role,nationality, password } = req.body

    try {
        const user = await User.create({ name, username, email,role,nationality, password })
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


module.exports ={
    createUser,
    getAllUsers,
    getUser,
    deleteUser,
    updateUser
}









