const i18n = require("../util/i18n")
const {MessageActionRow, MessageMenu, MessageMenuOption} = require('discord-buttons')
const {Guild} = require("../models/index")
const ISO6391 = require('iso-639-1')

module.exports = {
  name: "language",
  aliases: ["lang"],
  description: "language.description",
  async execute(message, args, guild) {
    const langs = i18n.getLocales().map(code => {
        let name = ISO6391.getNativeName(code)
        if (code === "zh_cn") name = "中文 - 中华人民共和国"
        if (code === "zh_sg") name = "中文 - 新加坡"
        if (code === "zh_tw") name = "中文 - 中華民國"
        if (code === "pt_br") name = "Português"
        return new MessageMenuOption().setLabel(name).setValue(code)
      }
    )
    const row = new MessageActionRow()
      .addComponent(new MessageMenu()
        .setID("language-menu")
        .setPlaceholder(i18n.__({phrase: "language.placeholder", locale: guild.locale}))
        .addOptions(langs)
      )
    const playOptions = await message.channel.send(
      i18n.__({phrase: "language.title", locale: guild.locale}),
      {components: [row]}
    )
    const filter = (reaction) => {
      return message.author.id === reaction.clicker.id
    }
    const collector = playOptions.createMenuCollector(filter, {time: 30000})
    collector.on('collect', async lang => {
      await Guild.updateOne({guildID: guild.guildID}, {locale: lang.values[0]})
      await lang.reply.defer()
      await message.channel.send(
        i18n.__({phrase: "language.result", locale: lang.values[0]})
      )
    })
    return true
  }
}