const express = require('express')
const router = express.Router()

router.get('/which', (req, res) => {
  res.send({
    id: process.env.ID
  })
})

module.exports = router