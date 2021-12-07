const {MessageEmbed} = require("discord.js");
const i18n = require("../util/i18n");

module.exports = {
  name: "queue",
  cooldown: 5,
  aliases: ["q"],
  description: "queue.description",
  async execute(message, args, guild) {
    const permissions = message.channel.permissionsFor(message.client.user);
    if (!permissions.has(["MANAGE_MESSAGES", "ADD_REACTIONS"]))
      return message.reply(i18n.__({phrase: "queue.missingPermissionMessage", locale: guild.locale}));

    const queue = message.client.queue.get(message.guild.id);
    if (!queue || !queue.songs.length) return message.channel.send(i18n.__({
      phrase: "queue.errorNotQueue",
      locale: guild.locale
    }));

    let currentPage = 0;
    const embeds = generateQueueEmbed(message, queue.songs, guild);

    const queueEmbed = await message.channel.send(
      `**${i18n.__mf({phrase: "queue.currentPage", locale: guild.locale})} ${currentPage + 1}/${embeds.length}**`,
      embeds[currentPage]
    );

    try {
      await queueEmbed.react("⬅️");
      await queueEmbed.react("⏹");
      await queueEmbed.react("➡️");
    } catch (error) {
      console.error(error);
      message.channel.send(error.message).catch(console.error);
    }

    const filter = (reaction, user) =>
      ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
    const collector = queueEmbed.createReactionCollector(filter, {time: 60000});

    collector.on("collect", async (reaction, user) => {
      try {
        if (reaction.emoji.name === "➡️") {
          if (currentPage < embeds.length - 1) {
            currentPage++;
            queueEmbed.edit(
              i18n.__mf({phrase: "queue.currentPage", locale: guild.locale}, {
                page: currentPage + 1,
                length: embeds.length
              }),
              embeds[currentPage]
            );
          }
        } else if (reaction.emoji.name === "⬅️") {
          if (currentPage !== 0) {
            --currentPage;
            queueEmbed.edit(
              i18n.__mf({phrase: "queue.currentPage", locale: guild.locale}, {
                page: currentPage + 1,
                length: embeds.length
              }),
              embeds[currentPage]
            );
          }
        } else {
          collector.stop();
          reaction.message.reactions.removeAll();
        }
        await reaction.users.remove(message.author.id);
      } catch (error) {
        console.error(error);
        return message.channel.send(error.message).catch(console.error);
      }
    });
  }
};

function generateQueueEmbed(message, queue, guild) {
  let embeds = [];
  let k = 10;

  for (let i = 0; i < queue.length; i += 10) {
    const current = queue.slice(i, k);
    let j = i;
    k += 10;

    const info = current.map((track) => `${++j} - [${track.title}](${track.url})`).join("\n");

    const embed = new MessageEmbed()
      .setTitle(i18n.__({phrase: "queue.embedTitle", locale: guild.locale}))
      .setThumbnail(message.guild.iconURL())
      .setColor("#F8AA2A")
      .setDescription(
        i18n.__mf({phrase: "queue.embedCurrentSong", locale: guild.locale}, {
          title: queue[0].title,
          url: queue[0].url,
          info: info
        })
      )
      .setTimestamp();
    embeds.push(embed);
  }

  return embeds;
}