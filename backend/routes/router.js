const express = require('express')

const router = express.Router()


router.get('/', (req,res) => {
    res.json({mssg:'Get all'})
})

router.get('/:id', (req,res) => {
    res.json({mssg:'Get single'})
})

router.post('/', (req,res) => {
    res.json({mssg:'Post new'})
})

router.delete('/:id', (req,res) => {
    res.json({mssg:'Delete a single'})
})

router.patch('/:id', (req,res) => {
    res.json({mssg:'Update a single'})
})

module.exports = router