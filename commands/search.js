const {MessageEmbed} = require("discord.js");
const YouTubeAPI = require("simple-youtube-api");
const {YOUTUBE_API_KEY} = require("../util/Util");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const i18n = require("../util/i18n");

module.exports = {
  name: "search",
  description: "search.description",
  async execute(message, args, guild) {
    if (!args.length)
      return message
        .reply(i18n.__mf({phrase: "search.usageReply", locale: guild.locale}, {prefix: message.client.prefix, name: module.exports.name}))
        .catch(console.error);
    if (message.channel.activeCollector) return message.reply(i18n.__({phrase: "search.errorAlreadyCollector", locale: guild.locale}));
    if (!message.member.voice.channel)
      return message.reply(i18n.__({phrase: "search.errorNotChannel", locale: guild.locale})).catch(console.error);

    const search = args.join(" ");

    let resultsEmbed = new MessageEmbed()
      .setTitle(i18n.__({phrase: "search.resultEmbedTitle", locale: guild.locale}))
      .setDescription(i18n.__mf({phrase: "search.resultEmbedDesc", locale: guild.locale}, {search: search}))
      .setColor("#F8AA2A");

    try {
      const results = await youtube.searchVideos(search, 10);
      results.map((video, index) => resultsEmbed.addField(video.shortURL, `${index + 1}. ${video.title}`));

      let resultsMessage = await message.channel.send(resultsEmbed);

      function filter(msg) {
        const pattern = /^[1-9][0]?(\s*,\s*[1-9][0]?)*$/;
        return pattern.test(msg.content);
      }

      message.channel.activeCollector = true;
      const response = await message.channel.awaitMessages(filter, {max: 1, time: 30000, errors: ["time"]});
      const reply = response.first().content;

      if (reply.includes(",")) {
        let songs = reply.split(",").map((str) => str.trim());

        for (let song of songs) {
          await message.client.commands
            .get("play")
            .execute(message, [resultsEmbed.fields[parseInt(song) - 1].name], guild);
        }
      } else {
        const choice = resultsEmbed.fields[parseInt(response.first()) - 1].name;
        message.client.commands.get("play").execute(message, [choice], guild);
      }

      message.channel.activeCollector = false;
      resultsMessage.delete().catch(console.error);
      response.first().delete().catch(console.error);
    } catch (error) {
      console.error(error);
      message.channel.activeCollector = false;
      message.reply(error.message).catch(console.error);
    }
  }
};
