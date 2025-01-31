const i18n = require("../util/i18n")
const {MessageEmbed} = require("discord.js")
const {play} = require("../include/play")
const YouTubeAPI = require("simple-youtube-api")
const scdl = require("soundcloud-downloader").default
const {YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID, DEFAULT_VOLUME} = require("../util/Util")
const youtube = new YouTubeAPI(YOUTUBE_API_KEY)

module.exports = {
  name: "playlist",
  cooldown: 5,
  aliases: ["pl"],
  description: "playlist.description",
  async execute(message, args, guild) {
    const {channel} = message.member.voice
    const serverQueue = message.client.queue.get(message.guild.id)

    if (!args.length)
      return message
        .reply(i18n.__mf({phrase: "playlist.usagesReply", locale: guild.locale}, {prefix: guild.prefix}))
        .catch(console.error)
    if (!channel) return message.reply(i18n.__({
      phrase: "playlist.errorNotChannel",
      locale: guild.locale
    })).catch(console.error)

    const permissions = channel.permissionsFor(message.client.user)
    if (!permissions.has("CONNECT")) return message.reply(i18n.__({
      phrase: "playlist.missingPermissionConnect",
      locale: guild.locale
    }))
    if (!permissions.has("SPEAK")) return message.reply(i18n.__({
      phrase: "missingPermissionSpeak",
      locale: guild.locale
    }))

    if (serverQueue && channel !== message.guild.me.voice.channel)
      return message
        .reply(i18n.__mf({phrase: "play.errorNotInSameChannel", locale: guild.locale}, {user: message.client.user}))
        .catch(console.error)

    const search = args.join(" ")
    const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi
    const url = args[0]
    const urlValid = pattern.test(args[0])

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: DEFAULT_VOLUME,
      muted: false,
      playing: true
    }

    let playlist = null
    let videos = []

    if (urlValid) {
      try {
        playlist = await youtube.getPlaylist(url, {part: "snippet"})
        videos = await playlist.getVideos(guild.maxPlaylistSize, {part: "snippet"})
      } catch (error) {
        console.error(error)
        return message.reply(i18n.__({
          phrase: "playlist.errorNotFoundPlaylist",
          locale: guild.locale
        })).catch(console.error)
      }
    } else if (scdl.isValidUrl(args[0])) {
      if (args[0].includes("/sets/")) {
        message.channel.send(i18n.__({phrase: "playlist.fetchingPlaylist", locale: guild.locale}))
        playlist = await scdl.getSetInfo(args[0], SOUNDCLOUD_CLIENT_ID)
        videos = playlist.tracks.map((track) => ({
          title: track.title,
          url: track.permalink_url,
          duration: track.duration / 1000
        }))
      }
    } else {
      try {
        const results = await youtube.searchPlaylists(search, 1, {part: "id"})
        playlist = results[0]
        videos = await playlist.getVideos(guild.maxPlaylistSize, {part: "snippet"})
      } catch (error) {
        console.error(error)
        return message.reply(error.message).catch(console.error)
      }
    }

    const newSongs = videos
      .filter((video) => video.title != "Private video" && video.title != "Deleted video")
      .map((video) => {
        return (song = {
          title: video.title,
          url: video.url,
          duration: video.durationSeconds
        })
      })

    serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs)

    let playlistEmbed = new MessageEmbed()
      .setTitle(`${playlist.title}`)
      .setDescription(newSongs.map((song, index) => `${index + 1}. ${song.title}`))
      .setURL(playlist.url)
      .setColor("#F8AA2A")
      .setTimestamp()

    if (playlistEmbed.description.length >= 2048)
      playlistEmbed.description =
        playlistEmbed.description.substr(0, 2007) + i18n.__({
          phrase: "playlist.playlistCharLimit",
          locale: guild.locale
        })

    message.channel.send(i18n.__mf({
      phrase: "playlist.startedPlaylist",
      locale: guild.locale
    }, {author: message.author}), playlistEmbed)

    if (!serverQueue) {
      message.client.queue.set(message.guild.id, queueConstruct)

      try {
        queueConstruct.connection = await channel.join()
        await queueConstruct.connection.voice.setSelfDeaf(true)
        play(queueConstruct.songs[0], message, guild)
      } catch (error) {
        console.error(error)
        message.client.queue.delete(message.guild.id)
        await channel.leave()
        return message.channel.send(i18n.__mf({
          phrase: "play.cantJoinChannel",
          locale: guild.locale
        }, {error: error})).catch(console.error)
      }
    }
  }
}