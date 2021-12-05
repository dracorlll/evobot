const mongoose = require("mongoose")

const redeemCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true
    },
    time: {
      type: Number
    },
    redeemed: {
      type: Boolean,
      default: false
    },
    usedBy: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("redeemCode", redeemCodeSchema)