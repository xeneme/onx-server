const express = require('express')
const router = new express.Router()
const UserReferralLink = require('../../user/userReferralLink')
const { requireAccessLight } = require('../../user/middleware')

router.get('/', requireAccessLight(), async (req, res) => {
  let ref = await UserReferralLink.find(res.locals.user._id)
  if (ref) res.send({ success: true, data: await ref.getData() })
  else res.send({ success: false, data: null })
})

router.get('/start', requireAccessLight(), async (req, res) => {
  let uid = res.locals.user._id
  let ref = await UserReferralLink.find(uid)
  if (!ref) {
    ref = new UserReferralLink(uid)
    ref.save()
  }
  res.send({
    success: true,
    data: await ref.getData()
  })
})

module.exports = router

