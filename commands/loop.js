const {canModifyQueue} = require("../util/Util");
const i18n = require("../util/i18n");

module.exports = {
  name: "loop",
  aliases: ["l"],
  description: "loop.description",
  execute(message, args, guild) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply(i18n.__({phrase: "loop.errorNotQueue", locale: guild.locale})).catch(console.error);
    if (!canModifyQueue(message.member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale});

    // toggle from false to true and reverse
    queue.loop = !queue.loop;
    return queue.textChannel
      .send(i18n.__mf({phrase: "loop.result", locale: guild.locale}, {loop: queue.loop ? i18n.__({phrase: "common.on", locale: guild.locale}) : i18n.__({phrase: "common.off", locale: guild.locale})}))
      .catch(console.error);
  }
};
