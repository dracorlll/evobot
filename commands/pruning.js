const i18n = require("../util/i18n")
const {Guild} = require("../models/index")

module.exports = {
  name: "pruning",
  description: "pruning.description",
  async execute(message, args, guild) {
    await Guild.updateOne({guildID: guild.guildID}, {pruning: !guild.pruning})
    return message.channel.send(
      i18n.__mf({phrase: "pruning.result", locale: guild.locale}, {
        result: !guild.pruning ? i18n.__({
          phrase: "common.enabled",
          locale: guild.locale
        }) : i18n.__({phrase: "common.disabled", locale: guild.locale})
      })
    )
  }
}