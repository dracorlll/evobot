const i18n = require("../util/i18n")
const {MessageEmbed} = require("discord.js")

// module.exports = {
//   name: "redeem",
//   aliases: [],
//   description: i18n.__("redeem.description"),
//   async execute(message, args) {
//     const redeem = await Redeem.updateOne({
//       code: args[0],
//       redeemed: false
//     }, {
//       $set: {
//         redeemed: true,
//         usedBy: message.guild.id,
//         usedDate: new Date()
//       }
//     })
//     const embedRedeem = new MessageEmbed()
//     if (redeem.nModified === 0) {
//       embedRedeem
//         .setTitle(i18n.__("redeem.title"))
//         .setDescription(i18n.__("redeem.notFound"))
//         .setColor("#ff0000")
//     } else {
//       embedRedeem
//         .setTitle(i18n.__("redeem.title"))
//         .setDescription(i18n.__("redeem.success"))
//         .setColor("#00ff00")
//     }
//     return message.channel.send(embedRedeem)
//   }
// }