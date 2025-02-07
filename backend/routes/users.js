const express = require('express')

const {createUser,getAllAvailableSessions,getUser,updateUser,
    getUserLogin,createSession,joinGameSession, isAuth,logOut, fetchPlayers,
    deleteSession,userRole,toggleActivity,joinLobbySession,updateTokenGroup
,userRoleUpdated} = require('../controllers/usersController')
 
const { requireAuth } = require('../middleware/authMiddleware')
 
const router = express.Router()   
 
router.post('/login', getUserLogin)

router.post('/register' , createUser) 
 
router.get('/isAuth', isAuth) 

router.get('/available-sessions', requireAuth, getAllAvailableSessions)

router.post('/create-session',requireAuth, createSession)  

router.post('/join-game-session', joinGameSession)

router.post('/join-lobby-session', joinLobbySession)
 
router.post('/update-token-group', updateTokenGroup)

router.get('/logout', requireAuth, logOut)

router.get('/user-role', requireAuth, userRole)

router.get('/user-role-updated', requireAuth, userRoleUpdated)




//***************/ all of the dynamic endpoint fucntions have to be below the rest so there is not express confusion
//Express will incorrectly treat "isAuth" as an id parameter, causing a problem when trying to execute it.
router.delete('/delete-session/:code', requireAuth, deleteSession)

router.get('/fetch-players/:sessionCode', requireAuth, fetchPlayers)

router.get('/:id',requireAuth ,getUser)

router.patch('/:id',requireAuth, updateUser)

router.patch('/toggle-activity/:code', requireAuth, toggleActivity)

module.exports = router