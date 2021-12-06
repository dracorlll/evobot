const i18n = require("../util/i18n")
const {MessageEmbed} = require("discord.js")
const {Redeem, Guild} = require("../models/index")
const MONTH = 2592000000

module.exports = {
  name: "redeem",
  description: "redeem.description",
  async execute(message, args, guild) {
    const redeem = await Redeem.findOne({code: args[0], redeemed: false})
    const embedRedeem = new MessageEmbed()
    if (!redeem) {
      embedRedeem
        .setTitle(i18n.__({phrase: "redeem.title", locale: guild.locale}))
        .setDescription(i18n.__({phrase: "redeem.notFound", locale: guild.locale}))
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
        .setTitle(i18n.__({phrase: "redeem.title", locale: guild.locale}))
        .setDescription(i18n.__mf({phrase: "redeem.success", locale: guild.locale}, {
          time: new Date(Date.now() + redeem.time * MONTH).toLocaleDateString()
        }))
        .setColor("#00ff00")
    }
    return message.channel.send(embedRedeem)
  }
}