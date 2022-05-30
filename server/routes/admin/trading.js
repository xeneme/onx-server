const express = require('express')
const router = express.Router()

const { requirePermissions } = require('./index')

const Trading = require('../../trading')

module.exports = router