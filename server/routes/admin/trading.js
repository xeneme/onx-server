const express = require('express')
const router = express.Router()

const { requirePermissions } = require('./index')

const Trading = require('../../trading')

router.post(
  '/trading/change',
  requirePermissions('write:users.binded'),
  async (req, res) => {
    const { percent, currency, direction, duration } = req.body

    if (typeof duration != 'number') {
      res.status(400).send({
        message: 'Invalid duration',
      })
    }
    if (typeof percent != 'number' || percent < 1) {
      res.status(400).send({
        message: 'Invalid percent',
      })
    } else if (
      !['BTC', 'ETH', 'LTC', 'XRP', 'LINK', 'DOT'].includes(currency)
    ) {
      res.status(400).send({
        message: 'Invalid currency',
      })
    } else if (!['up', 'down'].includes(direction)) {
      res.status(400).send({
        message: 'Invalid direction',
      })
    } else {
      const lobby = res.locals.user._id

      await Trading.addHistory(lobby)
      Trading.change(lobby, currency, direction, percent, Math.floor(duration))

      res.send({
        message: `The change percent for ${currency} has queued!`,
      })
    }
  },
)

module.exports = router