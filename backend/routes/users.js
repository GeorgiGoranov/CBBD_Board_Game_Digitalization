const express = require('express')
const {createUser,getAllUsers,getUser,deleteUser,updateUser,getUserLogin} = require('../controllers/usersController')

const router = express.Router()


router.get('/', getAllUsers)

router.post('/login', getUserLogin)

router.get('/:id',getUser)

router.post('/', createUser)

router.delete('/:id',deleteUser)

router.patch('/:id', updateUser)

module.exports = router