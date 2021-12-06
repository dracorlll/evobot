const {MessageEmbed} = require("discord.js");
const lyricsFinder = require("lyrics-finder");
const i18n = require("../util/i18n");

module.exports = {
  name: "lyrics",
  aliases: ["ly"],
  description: "lyrics.description",
  async execute(message, args, guild) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send(i18n.__({phrase: "lyrics.errorNotQueue", locale: guild.locale})).catch(console.error);

    let lyrics = null;
    const title = queue.songs[0].title;
    try {
      lyrics = await lyricsFinder(queue.songs[0].title, "");
      if (!lyrics) lyrics = i18n.__mf({phrase: "lyrics.lyricsNotFound", locale: guild.locale}, {title: title});
    } catch (error) {
      lyrics = i18n.__mf({phrase: "lyrics.lyricsNotFound", locale: guild.locale}, {title: title});
    }

    let lyricsEmbed = new MessageEmbed()
      .setTitle(i18n.__mf({phrase: "lyrics.embedTitle", locale: guild.locale}, {title: title}))
      .setDescription(lyrics)
      .setColor("#F8AA2A")
      .setTimestamp();

    if (lyricsEmbed.description.length >= 2048)
      lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
    return message.channel.send(lyricsEmbed).catch(console.error);
  }
};
