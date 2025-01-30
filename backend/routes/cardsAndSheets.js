const express = require('express');
const router = express.Router();

const CardModelC = require('../models/CardModelCompetency');
const CardModelD = require('../models/CardModelDilemma');
const CardModelOT = require('../models/CardModelOther');
const ThirdRoundModel = require('../models/ThirdRoundModel')
const ProfileModel = require('../models/ProfileModel') 

const { requireAuth } = require('../middleware/authMiddleware');
const { createCards, getOneCardPerCategory,getAllCategories,getAllCards,getAllDefaultProfiles,createProfile,deleteProfile,addNewSubcategory} = require('../controllers/cardsAndSheetsController');

// Use the updated functions
router.post('/competency', requireAuth, createCards(CardModelC));
router.post('/dilemma', requireAuth, createCards(CardModelD));
router.post('/other', requireAuth, createCards(CardModelOT));

router.get('/dilemma/random/:roomId', getOneCardPerCategory(CardModelD,ThirdRoundModel));
router.get('/get-all-categories',getAllCategories([CardModelC, CardModelOT]))
router.get('/get-all-cards', getAllCards([CardModelC, CardModelOT]))

router.get('/profiles', getAllDefaultProfiles(ProfileModel));
router.post('/create-profiles', requireAuth, createProfile(ProfileModel));
router.delete('/delete-profiles/:id', requireAuth, deleteProfile(ProfileModel));

router.patch('/add-new-subcategory', addNewSubcategory([CardModelC, CardModelOT]));




module.exports = router;
