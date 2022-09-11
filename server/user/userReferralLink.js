const { random } = require('lodash')
const Model = require('../models/UserReferralLink')
const Transaction = require('../models/Transaction')
const User = require('../models/User')
const Binding = require('../manager/binding')

class UserReferralLink {
  /**
   * 
   * @param {string} value User ID or a UserReferralLink document
   */
  constructor(value) {
    if (typeof value == 'object') {
      this.model = value
    } else if (typeof value == 'string') {
      this.model = new Model({
        user: value,
      })
    } else {
      throw new Error('UserReferralLink Exception: invalid value is provided while instancing')
    }
  }

  static async find(uid) {
    let doc = await Model.findOne({ user: uid })
    if (doc) {
      return new UserReferralLink(doc)
    } else {
      return null
    }
  }

  static async findByReferral(uid) {
    let doc = await Model.findOne({ referrals: { $elemMatch: { $eq: uid } } })
    if (doc) {
      return new UserReferralLink(doc)
    } else {
      return null
    }
  }


  get id() {
    return this.model.user
  }

  async save() {
    let doc = await this.model.save()
    this.model = doc
    return doc
  }

  async getData() {
    return {
      uref: this.id,
      referrals: this.model.referrals.length,
      earned: this.model.earned
    }
  }

  async onUserSignedUp(uid) {
    let results = await Transaction.find({ recipient: this.id }, 'amount currency').sort({ at: 1 })

    if (results[0]) {
      let { amount, currency } = results[0]
      amount *= 0.01
      UserReferralLink.createRewardTransfer(this.id, amount, currency)
      this.model.earned.push({ amount, currency: currency.toLowerCase() })
    }

    Binding.setSame(uid, this.id)
    this.model.referrals.push(uid)
    return await this.save()
  }

  async onUserDeposited(amount, currency) {
    amount *= 0.01
    console.log(amount, currency)
    UserReferralLink.createRewardTransfer(this.id, amount, currency)
    this.model.earned.push({ amount, currency: currency.toLowerCase() })
    this.save()
  }

  static async createRewardTransfer(uid, amount, currency) {
    let user = await User.findById(uid, 'wallets')
    if (!user) return
    let transaction = await (new Transaction({
      sender: 'uRefDep',
      recipient: user._id,
      name: 'Transfer',
      currency,
      amount: amount,
      status: 'completed',
    }).save())

    user.wallets[currency.toLowerCase()].balance += amount
    user.markModified('wallets')
    await user.save()

    return transaction
  }

  async createReferralRewardTransfer(rid) {
    let { min, max } = this.model.reward
    let amount = +random(min, max).toFixed(4)
    return await UserReferralLink.createRewardTransfer(rid, amount, 'Bitcoin')
  }
}

module.exports = UserReferralLink