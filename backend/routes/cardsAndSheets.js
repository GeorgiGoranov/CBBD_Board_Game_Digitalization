const express = require('express');
const router = express.Router();

const CardModelC = require('../models/CardModelCompetency');
const CardModelD = require('../models/CardModelDilemma');
const CardModelOT = require('../models/CardModelOther');

const { requireAuth } = require('../middleware/authMiddleware');
const { createCards, getOneCardPerCategory,getAllCategories } = require('../controllers/cardsAndSheetsController');

// Use the updated functions
router.post('/competency', requireAuth, createCards(CardModelC));
router.get('/competency/random', getOneCardPerCategory(CardModelC));

router.post('/dilemma', requireAuth, createCards(CardModelD));
router.get('/dilemma/random', getOneCardPerCategory(CardModelD));

router.post('/other', requireAuth, createCards(CardModelOT));
router.get('/other/random', getOneCardPerCategory(CardModelOT));

router.get('/get-all',getAllCategories([CardModelC, CardModelOT]))

module.exports = router;
