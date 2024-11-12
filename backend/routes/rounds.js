const express = require('express')

const {saveRoomState,getRoomState} = require('../controllers/roundsController')

const { requireAuth } = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/save-state', saveRoomState)
router.get('/get-state/:roomId', getRoomState); 



module.exports = router