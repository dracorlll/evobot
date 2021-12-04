/**
 * Module Imports
 */
const {Client, Collection} = require("discord.js")
const {readdirSync} = require("fs")
const {join} = require("path")
const {TOKEN, PREFIX} = require("./util/Util")
const i18n = require("./util/i18n")
// const Guild = require("./models/Guild")
const db = require("./db/index").connectDB()

const client = new Client({
  disableMentions: "everyone",
  restTimeOffset: 0
})

client.login(TOKEN)
client.commands = new Collection()
client.prefix = PREFIX
client.queue = new Map()
const cooldowns = new Collection()
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`)
  client.user.setActivity(`${PREFIX}help and ${PREFIX}play`, {type: "LISTENING"})
})
client.on("warn", (info) => console.log(info))
client.on("error", console.error)

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"))
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`))
  client.commands.set(command.name, command)
}

client.on("message", async (message) => {
  if (message.author.bot) return
  if (!message.guild) return

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`)
  if (!prefixRegex.test(message.content)) return

  const [, matchedPrefix] = message.content.match(prefixRegex)

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

  if (!command) return

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection())
  }

  const now = Date.now()
  const timestamps = cooldowns.get(command.name)
  const cooldownAmount = (command.cooldown || 1) * 1000

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000
      return message.reply(
        i18n.__mf("common.cooldownMessage", {time: timeLeft.toFixed(1), name: command.name})
      )
    }
  }

  timestamps.set(message.author.id, now)
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

  try {
    // komut redeem mi kontrol et değilse expire time ve ratelimit kontrolü yap
    // if (command.name === "redeem") command.execute(message, args)
    // else {
    //   const guild = await Guild.findOne({guildID: message.guild.id})
    //   if (!guild.expireTime) {
    //     if (guild.rateLimit < 5) {
    //       await Guild.updateOne({guildID: message.guild.id}, {rateLimit: guild.rateLimit + 1})
    //       command.execute(message, args)
    //     } else return message.reply(i18n.__mf("common.rateLimit"))
    //   } else {
    //     if (guild.expireTime > Date.now()) command.execute(message, args)
    //     else return message.reply(i18n.__mf("common.expired"))
    //   }
    // }

    /*
        
        check if command is redeem, if so, execute command
        else check if guild has a expire time,
        if no, check if ratelimit is less than 5, execute command
        if yes, check expire time, if greater than Date.now(), execute command
        else return
    */

    command.execute(message, args)
  } catch (error) {
    console.error(error)
    message.reply(i18n.__("common.errorCommand")).catch(console.error)
  }
})

// bot bir server'a katıldığında yapılacaklar
client.on('guildCreate', async guild => {
//guildID vb. veritabanına ekleme
//   await new Guild({
//     guildID: guild.id,
//     owner: guild.ownerID,
//     expireTime: null,
//     rateLimit: 0
//   }).save()
})