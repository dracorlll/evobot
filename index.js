/**
 * Module Imports
 */
const {Client, Collection} = require("discord.js")
const {readdirSync} = require("fs")
const {join} = require("path")
let {TOKEN} = require("./util/Util")
const i18n = require("./util/i18n")
const {Guild} = require("./models/index")
const disbut = require('discord-buttons')

require("./db/index").connectDB()

const client = new Client({
  disableMentions: "everyone",
  restTimeOffset: 0
})
disbut(client)
client.login(TOKEN)
client.commands = new Collection()
client.queue = new Map()
const cooldowns = new Collection()
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`)
  client.user.setActivity(`support@discords.tech`, {type: "LISTENING"})
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

  let guild = await Guild.findOne({guildID: message.guild.id})
  if (!guild) guild = await guildCreate(message.guild)

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(guild.prefix)})\\s*`)
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
        i18n.__mf({phrase: "common.cooldownMessage", locale: guild.locale}, {
          time: timeLeft.toFixed(1),
          name: command.name
        })
      )
    }
  }

  timestamps.set(message.author.id, now)
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
  try {
    // komut redeem mi kontrol et değilse expire time ve ratelimit kontrolü yap
    if (command.name === "redeem") command.execute(message, args, guild)
    else {
      const trial = (Date.now() - new Date(guild.createdAt)) / 1000 / 60 / 60
      if (!guild.expireTime) {

        if (trial < 72) command.execute(message, args, guild)
        else return message.reply(i18n.__mf({phrase: "common.rateLimit", locale: guild.locale}))
      } else {
        if (guild.expireTime > Date.now()) command.execute(message, args, guild)
        else return message.reply(i18n.__mf({phrase: "common.expired", locale: guild.locale}))
      }
    }

  } catch (error) {
    console.error(error)
    message.reply(i18n.__({phrase: "common.errorCommand", locale: guild.locale})).catch(console.error)
  }
})

// bot bir server'a katıldığında yapılacaklar
client.on('guildCreate', async guild => {
  // guildID vb. veritabanına ekleme
  const isGuildExist = await Guild.findOne({guildID: guild.id})
  if (!isGuildExist)
    return guildCreate(guild)
})

const guildCreate = async guild => {
  return Guild.create({
    guildID: guild.id,
    owner: guild.ownerID,
    expireTime: null,
    locale: "en",
    prefix: "!",
    maxPlaylistSize: 10,
    pruning: false
  })
}