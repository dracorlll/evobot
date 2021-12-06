const fs = require("fs");
const i18n = require("../util/i18n");

let config;

try {
  config = require("../config.json");
} catch (error) {
  config = null;
}

module.exports = {
  name: "pruning",
  description: "pruning.description",
  execute(message, args, guild) {
    if (!config) return;
    config.PRUNING = !config.PRUNING;

    fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.log(err);
        return message.channel.send(i18n.__({phrase: "pruning.errorWritingFile", locale: guild.locale})).catch(console.error);
      }

      return message.channel
        .send(
          i18n.__mf({phrase: "pruning.result", locale: guild.locale}, {
            result: config.PRUNING ? i18n.__({phrase: "common.enabled", locale: guild.locale}) : i18n.__({phrase: "common.disabled", locale: guild.locale})
          })
        )
        .catch(console.error);
    });
  }
};
