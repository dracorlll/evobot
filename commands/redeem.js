const i18n = require("../util/i18n")
const {MessageEmbed} = require("discord.js")
const {Redeem, Guild} = require("../models/index")
const MONTH = 2592000000

module.exports = {
  name: "redeem",
  description: i18n.__("redeem.description"),
  async execute(message, args) {
    const redeem = await Redeem.findOne({code: args[0], redeemed: false})
    const embedRedeem = new MessageEmbed()
    if (!redeem) {
      embedRedeem
        .setTitle(i18n.__("redeem.title"))
        .setDescription(i18n.__("redeem.notFound"))
        .setColor("#ff0000")
    } else {
      await Redeem.updateOne({
        code: args[0]
      }, {
        $set: {
          redeemed: true,
          usedBy: message.guild.id
        }
      })
      await Guild.updateOne({guildID: message.guild.id}, {expireTime: Date.now() + redeem.time * MONTH})
      embedRedeem
        .setTitle(i18n.__("redeem.title"))
        .setDescription(i18n.__mf("redeem.success", {
          time: new Date(Date.now() + redeem.time * MONTH).toLocaleDateString()
        }))
        .setColor("#00ff00")
    }
    return message.channel.send(embedRedeem)
  }
}