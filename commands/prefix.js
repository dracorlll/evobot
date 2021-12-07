const i18n = require("../util/i18n")
const {Guild} = require("../models/index")

module.exports = {
  name: "prefix",
  description: "prefix.description",
  async execute(message, args, guild) {
    try {
      await Guild.updateOne({guildID: guild.guildID}, {prefix: args[0]})
      return message.reply(i18n.__mf({
        phrase: "prefix.result",
        locale: guild.locale
      }, {prefix: args[0]}))
    } catch (error) {
      return message.channel.send(i18n.__({
        phrase: "common.errorCommand",
        locale: guild.locale
      }))
    }

  }
}