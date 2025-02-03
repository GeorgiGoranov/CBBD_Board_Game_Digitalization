const express = require('express')

const FirstRound = require('../models/FirstRoundModel')
const SecondRound = require('../models/SecondRoundModel')
const ThirdRound = require('../models/ThirdRoundModel')


const {saveRoomStateMode,getRoomStateMode,
    saveMessage,getMessage,saveThirdRoomStateMode,getCurrentStateThirdRound
,getAllCurrentStateThirdRoundCards,createChatRoom} = require('../controllers/roundsController')

const router = express.Router()

router.post('/save-state-first-round', saveRoomStateMode(FirstRound))
router.post('/save-state-second-round', saveRoomStateMode(SecondRound))
router.post('/save-state-third-round', saveThirdRoomStateMode(ThirdRound))


router.get('/get-state-first-round/:roomId', getRoomStateMode(FirstRound)); 
router.get('/get-state-second-round/:roomId', getRoomStateMode(SecondRound)); 
router.get('/get-state-third-round/:roomId', getCurrentStateThirdRound(ThirdRound)); 
router.get('/get-all-state-third-round-cards/:roomId', getAllCurrentStateThirdRoundCards(ThirdRound)); 




router.post('/create-message-room', createChatRoom) 
router.post('/save-message', saveMessage) 
router.get('/get-message/:roomId', getMessage)

 

module.exports = router