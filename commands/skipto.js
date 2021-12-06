const {canModifyQueue} = require("../util/Util");
const i18n = require("../util/i18n");

module.exports = {
  name: "skipto",
  aliases: ["st"],
  description: "skipto.description",
  execute(message, args, guild) {
    if (!args.length || isNaN(args[0]))
      return message
        .reply(i18n.__mf({phrase: "skipto.usageReply", locale: guild.locale}, {prefix: message.client.prefix, name: module.exports.name}))
        .catch(console.error);

    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send(i18n.__({phrase: "skipto.errorNotQueue", locale: guild.locale})).catch(console.error);
    if (!canModifyQueue(message.member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale});
    if (args[0] > queue.songs.length)
      return message
        .reply(i18n.__mf({phrase: "skipto.errorNotValid", locale: guild.locale}, {length: queue.songs.length}))
        .catch(console.error);

    queue.playing = true;

    if (queue.loop) {
      for (let i = 0;i < args[0] - 2;i++) {
        queue.songs.push(queue.songs.shift());
      }
    } else {
      queue.songs = queue.songs.slice(args[0] - 2);
    }

    queue.connection.dispatcher.end();
    queue.textChannel
      .send(i18n.__mf({phrase: "skipto.result", locale: guild.locale}, {author: message.author, arg: args[0] - 1}))
      .catch(console.error);
  }
};
