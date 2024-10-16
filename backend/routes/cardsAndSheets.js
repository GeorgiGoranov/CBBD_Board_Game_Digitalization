const express = require('express')

const {createCards} = require('../controllers/cardsAndSheetsController')

const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/cards', requireAuth, createCards)

module.exports = router