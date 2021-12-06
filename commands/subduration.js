const i18n = require("../util/i18n")
const {Guild} = require("../models/index")

module.exports = {
  name: "subduration",
  aliases: ["sub", "duration"],
  description: "subduration.description",
  async execute(message, args, guild) {
    //const guild = await Guild.findOne({guildID: message.guild.id})
    message
      .reply(i18n.__mf({phrase: "subduration.result", locale: guild.locale}, {time: new Date(guild.expireTime).toLocaleDateString()}))
      .catch(console.error)
  }
}