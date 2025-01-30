const express = require('express');
const router = express.Router();

const CardModelC = require('../models/CardModelCompetency');
const CardModelD = require('../models/CardModelDilemma');
const CardModelOT = require('../models/CardModelOther');
const ThirdRoundModel = require('../models/ThirdRoundModel')
const ProfileModel = require('../models/ProfileModel')

const { requireAuth } = require('../middleware/authMiddleware');
const { createCards, getOneCardPerCategory,getAllCategories,getAllCards,getAllDefaultProfiles} = require('../controllers/cardsAndSheetsController');

// Use the updated functions
router.post('/competency', requireAuth, createCards(CardModelC));
router.post('/dilemma', requireAuth, createCards(CardModelD));
router.post('/other', requireAuth, createCards(CardModelOT));

// router.get('/competency/random', getOneCardPerCategory(CardModelC));
router.get('/dilemma/random/:roomId', getOneCardPerCategory(CardModelD,ThirdRoundModel));
// router.get('/other/random', getOneCardPerCategory(CardModelOT));
router.get('/profiles', getAllDefaultProfiles(ProfileModel));




router.get('/get-all-categories',getAllCategories([CardModelC, CardModelOT]))

router.get('/get-all-cards', getAllCards([CardModelC, CardModelOT]))



module.exports = router;
