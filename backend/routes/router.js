const express = require('express')
const Users = require('../models/UsersModel')

const router = express.Router()


router.get('/', (req, res) => {
    res.json({ mssg: 'Get all' })
})

router.get('/:id', (req, res) => {
    res.json({ mssg: 'Get single' })
})

router.post('/', async (req, res) => {
    const { name, username, nationality, password } = req.body

    try {
        const user = await Users.create({ name, username, nationality, password })
        res.status(200).json(user)
    } catch {
        res.status(400).json({ error: error.message })

    }
  
})

router.delete('/:id', (req, res) => {
    res.json({ mssg: 'Delete a single' })
})

router.patch('/:id', (req, res) => {
    res.json({ mssg: 'Update a single' })
})

module.exports = router