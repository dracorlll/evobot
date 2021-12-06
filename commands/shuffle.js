const {canModifyQueue} = require("../util/Util");
const i18n = require("../util/i18n");

module.exports = {
  name: "shuffle",
  description: "shuffle.description",
  execute(message, args, guild) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send(i18n.__({phrase: "shuffle.errorNotQueue", locale: guild.locale})).catch(console.error);
    if (!canModifyQueue(message.member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale});

    let songs = queue.songs;
    for (let i = songs.length - 1;i > 1;i--) {
      let j = 1 + Math.floor(Math.random() * i);
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    queue.songs = songs;
    message.client.queue.set(message.guild.id, queue);
    queue.textChannel.send(i18n.__mf({phrase: "shuffle.result", locale: guild.locale}, {author: message.author})).catch(console.error);
  }
};
