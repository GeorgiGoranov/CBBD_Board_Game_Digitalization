const express = require('express')

const {createCards} = require('../controllers/cardsAndSheetsController')

const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/compenetices', requireAuth, createCards)

module.exports = router