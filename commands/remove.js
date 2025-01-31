const {canModifyQueue} = require("../util/Util");
const i18n = require("../util/i18n");

const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;

module.exports = {
  name: "remove",
  aliases: ["rm"],
  description: "remove.description",
  execute(message, args, guild) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) return message.channel.send(i18n.__({
      phrase: "remove.errorNotQueue",
      locale: guild.locale
    })).catch(console.error);
    if (!canModifyQueue(message.member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale});
    if (!args.length) return message.reply(i18n.__mf({
      phrase: "remove.usageReply",
      locale: guild.locale
    }, {prefix: guild.prefix}));

    const arguments = args.join("");
    const songs = arguments.split(",").map((arg) => parseInt(arg));
    let removed = [];

    if (pattern.test(arguments)) {
      queue.songs = queue.songs.filter((item, index) => {
        if (songs.find((songIndex) => songIndex - 1 === index)) removed.push(item);
        else return true;
      });

      queue.textChannel.send(
        i18n.__mf({phrase: "remove.result", locale: guild.locale}, {
          title: removed.map((song) => song.title).join("\n"),
          author: message.author.id
        })
      );
    } else if (!isNaN(args[0]) && args[0] >= 1 && args[0] <= queue.songs.length) {
      console.log("we got elsed!");
      return queue.textChannel.send(
        i18n.__mf({phrase: "remove.result", locale: guild.locale}, {
          title: queue.songs.splice(args[0] - 1, 1)[0].title,
          author: message.author.id
        })
      );
    } else {
      console.log("we got the last one");
      return message.reply(i18n.__mf({phrase: "remove.usageReply", locale: guild.locale}, {prefix: guild.prefix}));
    }
  }
};