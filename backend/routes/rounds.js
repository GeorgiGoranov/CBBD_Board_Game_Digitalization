const express = require('express')

const {saveRoomState,getRoomState,saveMessage,getMessage} = require('../controllers/roundsController')

const router = express.Router()

router.post('/save-state', saveRoomState)
router.get('/get-state/:roomId', getRoomState); 
router.post('/save-message', saveMessage) 
router.get('/get-message/:roomId', getMessage)

 

module.exports = router