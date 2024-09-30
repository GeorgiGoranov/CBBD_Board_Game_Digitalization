const express = require('express')

const {createUser,getAllUsers,getUser,deleteUser,updateUser,getUserLogin,createSession,joinSession, isAuth,logOut} = require('../controllers/usersController')
const { requireAuth } = require('../middleware/authMiddleware')
const router = express.Router()


router.post('/login', getUserLogin)
router.post('/', requireAuth , createUser)

router.get('/', requireAuth, getAllUsers)


router.get('/:id',requireAuth,getUser)

router.delete('/:id',requireAuth,deleteUser)

router.patch('/:id',requireAuth, updateUser)

router.post('/create-session',requireAuth, createSession)

router.post('/join-session',requireAuth, joinSession)

router.get('/isAuth', isAuth)

router.get('/logout', requireAuth, logOut)

module.exports = router