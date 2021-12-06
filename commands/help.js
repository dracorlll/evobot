const {MessageEmbed} = require("discord.js");
const i18n = require("../util/i18n");

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "help.description",
  execute(message, args, guild) {
    let commands = message.client.commands.array();

    let helpEmbed = new MessageEmbed()
      .setTitle(i18n.__mf({phrase: "help.embedTitle", locale: guild.locale}, {botname: message.client.user.username}))
      .setDescription(i18n.__({phrase: "help.embedDescription", locale: guild.locale}))
      .setColor("#F8AA2A");

    commands.forEach((cmd) => {
      helpEmbed.addField(
        `**${message.client.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases})` : ""}**`,
        `${i18n.__({phrase: cmd.description, locale: guild.locale})}`,
        true
      );
    });

    helpEmbed.setTimestamp();

    return message.channel.send(helpEmbed).catch(console.error);
  }
};
