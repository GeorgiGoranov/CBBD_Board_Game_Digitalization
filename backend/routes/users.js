const express = require('express')

const {createUser,getAllUsers,getUser,deleteUser,updateUser,getUserLogin,createSession,joinSession} = require('../controllers/usersController')

const router = express.Router()


router.get('/', getAllUsers)

router.post('/login', getUserLogin)

router.get('/:id',getUser)

router.post('/', createUser)

router.delete('/:id',deleteUser)

router.patch('/:id', updateUser)

router.post('/create-session', createSession)

router.post('/join-session', joinSession)

module.exports = router