const {canModifyQueue} = require("../util/Util");
const i18n = require("../util/i18n");

module.exports = {
  name: "resume",
  aliases: ["r"],
  description: "resume.description",
  execute(message, args, guild) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply(i18n.__({phrase: "resume.errorNotQueue", locale: guild.locale})).catch(console.error);
    if (!canModifyQueue(message.member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale});

    if (!queue.playing) {
      queue.playing = true;
      queue.connection.dispatcher.resume();
      return queue.textChannel
        .send(i18n.__mf({phrase: "resume.resultNotPlaying", locale: guild.locale}, {author: message.author}))
        .catch(console.error);
    }

    return message.reply(i18n.__({phrase: "resume.errorPlaying", locale: guild.locale})).catch(console.error);
  }
};
