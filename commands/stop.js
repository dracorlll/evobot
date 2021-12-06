const {canModifyQueue} = require("../util/Util");
const i18n = require("../util/i18n");

module.exports = {
  name: "stop",
  description: "stop.description",
  execute(message, args, guild) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) return message.reply(i18n.__({phrase: "stop.errorNotQueue", locale: guild.locale})).catch(console.error);
    if (!canModifyQueue(message.member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale});

    queue.songs = [];
    queue.connection.dispatcher.end();
    queue.textChannel.send(i18n.__mf({phrase: "stop.result", locale: guild.locale}, {author: message.author})).catch(console.error);
  }
};
