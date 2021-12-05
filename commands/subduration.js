const i18n = require("../util/i18n")
const {Guild} = require("../models/index")

module.exports = {
  name: "subduration",
  aliases: ["sub", "duration"],
  description: i18n.__("subduration.description"),
  async execute(message) {
    const guild = await Guild.findOne({guildID: message.guild.id})
    message
      .reply(i18n.__mf("subduration.result", {time: new Date(guild.expireTime).toLocaleDateString()}))
      .catch(console.error)
  }
}