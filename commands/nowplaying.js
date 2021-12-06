const {splitBar} = require("string-progressbar");
const {MessageEmbed} = require("discord.js");
const i18n = require("../util/i18n");

module.exports = {
  name: "np",
  description: "nowplaying.description",
  execute(message, args, guild) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue || !queue.songs.length) return message.reply(i18n.__({phrase: "nowplaying.errorNotQueue", locale: guild.locale})).catch(console.error);

    const song = queue.songs[0];
    const seek = (queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime) / 1000;
    const left = song.duration - seek;

    let nowPlaying = new MessageEmbed()
      .setTitle(i18n.__({phrase: "nowplaying.embedTitle", locale: guild.locale}))
      .setDescription(`${song.title}\n${song.url}`)
      .setColor("#F8AA2A")
      .setAuthor(message.client.user.username);

    if (song.duration > 0) {
      nowPlaying.addField(
        "\u200b",
        new Date(seek * 1000).toISOString().substr(11, 8) +
        "[" +
        splitBar(song.duration == 0 ? seek : song.duration, seek, 20)[0] +
        "]" +
        (song.duration == 0 ? " ◉ LIVE" : new Date(song.duration * 1000).toISOString().substr(11, 8)),
        false
      );
      nowPlaying.setFooter(
        i18n.__mf({phrase: "nowplaying.timeRemaining", locale: guild.locale}, {time: new Date(left * 1000).toISOString().substr(11, 8)})
      );
    }

    return message.channel.send(nowPlaying);
  }
};
