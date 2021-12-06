const {canModifyQueue} = require("../util/Util");
const i18n = require("../util/i18n");

module.exports = {
  name: "volume",
  aliases: ["v"],
  description: "volume.description",
  execute(message, args, guild) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) return message.reply(i18n.__({phrase: "volume.errorNotQueue", locale: guild.locale})).catch(console.error);
    if (!canModifyQueue(message.member))
      return message.reply(i18n.__({phrase: "volume.errorNotChannel", locale: guild.locale})).catch(console.error);

    if (!args[0])
      return message.reply(i18n.__mf({phrase: "volume.currentVolume", locale: guild.locale}, {volume: queue.volume})).catch(console.error);
    if (isNaN(args[0])) return message.reply(i18n.__({phrase: "volume.errorNotNumber", locale: guild.locale})).catch(console.error);
    if (Number(args[0]) > 100 || Number(args[0]) < 0)
      return message.reply(i18n.__({phrase: "volume.errorNotValid", locale: guild.locale})).catch(console.error);

    queue.volume = args[0];
    queue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);
    return queue.textChannel.send(i18n.__mf({phrase: "volume.result", locale: guild.locale}, {arg: args[0]})).catch(console.error);
  }
};
