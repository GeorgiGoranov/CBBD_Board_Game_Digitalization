const express = require('express')

const {createCards,getOneCardPerCategory} = require('../controllers/cardsAndSheetsController')

const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/compenetices', requireAuth, createCards)

router.get('/competency-cards', getOneCardPerCategory)

module.exports = router 