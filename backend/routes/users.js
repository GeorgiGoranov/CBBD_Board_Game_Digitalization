const express = require('express')

const {createUser,getAllAvailableSessions,getUser,deleteUser,updateUser,getUserLogin,createSession,joinSession, isAuth,logOut, fetchPlayers} = require('../controllers/usersController')
const { requireAuth } = require('../middleware/authMiddleware')
const router = express.Router()


router.post('/login', getUserLogin)

router.post('/register' , createUser)

router.get('/isAuth', isAuth)

router.get('/available-sessions', requireAuth, getAllAvailableSessions)

router.post('/create-session',requireAuth, createSession)

router.post('/join-session',requireAuth, joinSession)

router.get('/logout', requireAuth, logOut)


//***************/ all of the dynamic endpoint fucntions have to be below the rest so there is not express confusion
//Express will incorrectly treat "isAuth" as an id parameter, causing a problem when trying to execute it.
router.get('/fetch-players/:sessionCode', requireAuth, fetchPlayers)

router.get('/:id',requireAuth ,getUser)

router.delete('/:id',requireAuth,deleteUser)

router.patch('/:id',requireAuth, updateUser)

module.exports = router