const mongoose = require("mongoose")

const guildSchema = new mongoose.Schema(
  {
    guildID: {
      type: String,
      required: true
    },
    owner: {
      type: String,
      required: true
    },
    expireTime: {
      type: Number
    },
    rateLimit: {
      type: Number,
      default: 0
    },
    locale: {
      type: String,
      default: "en"
    },
    pruning: {
      type: Boolean,
      default: false
    },
    prefix: {
      type: String,
      default: "en"
    },
    maxPlaylistSize: {
      type: Number,
      default: 10
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("guild", guildSchema)