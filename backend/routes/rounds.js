const express = require('express')

const FirstRound = require('../models/FirstRoundModel')
const SecondRound = require('../models/SecondRoundModel')


const {saveRoomStateMode,getRoomStateMode,saveMessage,getMessage} = require('../controllers/roundsController')

const router = express.Router()

router.post('/save-state-first-round', saveRoomStateMode(FirstRound))
router.post('/save-state-second-round', saveRoomStateMode(SecondRound))

router.get('/get-state-first-round/:roomId', getRoomStateMode(FirstRound)); 
router.get('/get-state-second-round/:roomId', getRoomStateMode(SecondRound)); 

router.post('/save-message', saveMessage) 
router.get('/get-message/:roomId', getMessage)

 

module.exports = router