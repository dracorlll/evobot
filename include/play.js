const ytdl = require("ytdl-core-discord")
const scdl = require("soundcloud-downloader").default
const {canModifyQueue, STAY_TIME} = require("../util/Util")
const i18n = require("../util/i18n")

module.exports = {
  async play(song, message, guild) {
    const {SOUNDCLOUD_CLIENT_ID} = require("../util/Util")
    let config

    try {
      config = require("../config.json")
    } catch (error) {
      config = null
    }

    const PRUNING = config ? config.PRUNING : process.env.PRUNING

    const queue = message.client.queue.get(message.guild.id)

    if (!song) {
      setTimeout(function () {
        if (queue.connection.dispatcher && message.guild.me.voice.channel) return
        queue.channel.leave()
        !PRUNING && queue.textChannel.send(i18n.__({phrase: "play.leaveChannel", locale: guild.locale}))
      }, STAY_TIME * 1000)
      !PRUNING && queue.textChannel.send(i18n.__({phrase: "play.queueEnded", locale: guild.locale})).catch(console.error)

      return message.client.queue.delete(message.guild.id)
    }

    let stream = null
    let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus"

    try {
      if (song.url.includes("youtube.com")) {
        stream = await ytdl(song.url, {highWaterMark: 1 << 25})
      } else if (song.url.includes("soundcloud.com")) {
        try {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, SOUNDCLOUD_CLIENT_ID)
        } catch (error) {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3, SOUNDCLOUD_CLIENT_ID)
          streamType = "unknown"
        }
      }
    } catch (error) {
      if (queue) {
        queue.songs.shift()
        module.exports.play(queue.songs[0], message, guild)
      }

      console.error(error)
      return message.channel.send(
        i18n.__mf({phrase: "play.queueError", locale: guild.locale}, {error: error.message ? error.message : error})
      )
    }

    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id))

    const dispatcher = queue.connection
      .play(stream, {type: streamType}, guild)
      .on("finish", () => {
        if (collector && !collector.ended) collector.stop()

        queue.connection.removeAllListeners("disconnect")

        if (queue.loop) {
          // if loop is on, push the song back at the end of the queue
          // so it can repeat endlessly
          let lastSong = queue.songs.shift()
          queue.songs.push(lastSong)
          module.exports.play(queue.songs[0], message, guild)
        } else {
          // Recursively play the next song
          queue.songs.shift()
          module.exports.play(queue.songs[0], message, guild)
        }
      })
      .on("error", (err) => {
        console.error(err)
        queue.songs.shift()
        module.exports.play(queue.songs[0], message, guild)
      })
    dispatcher.setVolumeLogarithmic(queue.volume / 100)

    try {
      var playingMessage = await queue.textChannel.send(
        i18n.__mf({phrase: "play.startedPlaying", locale: guild.locale}, {title: song.title, url: song.url})
      )
      await playingMessage.react("⏭")
      await playingMessage.react("⏯")
      await playingMessage.react("🔇")
      await playingMessage.react("🔉")
      await playingMessage.react("🔊")
      await playingMessage.react("🔁")
      await playingMessage.react("🔀")
      await playingMessage.react("⏹")
    } catch (error) {
      console.error(error)
    }

    const filter = (reaction, user) => user.id !== message.client.user.id
    var collector = playingMessage.createReactionCollector(filter, {
      time: song.duration > 0 ? song.duration * 1000 : 600000
    })

    collector.on("collect", (reaction, user) => {
      if (!queue) return
      const member = message.guild.member(user)

      switch (reaction.emoji.name) {
        case "⏭":
          queue.playing = true
          reaction.users.remove(user).catch(console.error)
          if (!canModifyQueue(member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale})
          queue.connection.dispatcher.end()
          queue.textChannel.send(i18n.__mf({phrase: "play.skipSong", locale: guild.locale}, {author: user})).catch(console.error)
          collector.stop()
          break

        case "⏯":
          reaction.users.remove(user).catch(console.error)
          if (!canModifyQueue(member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale})
          if (queue.playing) {
            queue.playing = !queue.playing
            queue.connection.dispatcher.pause(true)
            queue.textChannel.send(i18n.__mf({phrase: "play.pauseSong", locale: guild.locale}, {author: user})).catch(console.error)
          } else {
            queue.playing = !queue.playing
            queue.connection.dispatcher.resume()
            queue.textChannel.send(i18n.__mf({phrase: "play.resumeSong", locale: guild.locale}, {author: user})).catch(console.error)
          }
          break

        case "🔇":
          reaction.users.remove(user).catch(console.error)
          if (!canModifyQueue(member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale})
          queue.muted = !queue.muted
          if (queue.muted) {
            queue.connection.dispatcher.setVolumeLogarithmic(0)
            queue.textChannel.send(i18n.__mf({phrase: "play.mutedSong", locale: guild.locale}, {author: user})).catch(console.error)
          } else {
            queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100)
            queue.textChannel.send(i18n.__mf({phrase: "play.unmutedSong", locale: guild.locale}, {author: user})).catch(console.error)
          }
          break

        case "🔉":
          reaction.users.remove(user).catch(console.error)
          if (queue.volume == 0) return
          if (!canModifyQueue(member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale})
          queue.volume = Math.max(queue.volume - 10, 0)
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100)
          queue.textChannel
            .send(i18n.__mf({phrase: "play.decreasedVolume", locale: guild.locale}, {author: user, volume: queue.volume}))
            .catch(console.error)
          break

        case "🔊":
          reaction.users.remove(user).catch(console.error)
          if (queue.volume == 100) return
          if (!canModifyQueue(member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale})
          queue.volume = Math.min(queue.volume + 10, 100)
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100)
          queue.textChannel
            .send(i18n.__mf({phrase: "play.increasedVolume", locale: guild.locale}, {author: user, volume: queue.volume}))
            .catch(console.error)
          break

        case "🔁":
          reaction.users.remove(user).catch(console.error)
          if (!canModifyQueue(member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale})
          queue.loop = !queue.loop
          queue.textChannel
            .send(
              i18n.__mf({phrase: "play.loopSong", locale: guild.locale}, {
                author: user,
                loop: queue.loop ? i18n.__({phrase: "common.on", locale: guild.locale}) : i18n.__({phrase: "common.off", locale: guild.locale})
              })
            )
            .catch(console.error)
          break

        case "🔀":
          reaction.users.remove(user).catch(console.error)
          if (!canModifyQueue(member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale})

          let songs = queue.songs
          for (let i = songs.length - 1;i > 1;i--) {
            let j = 1 + Math.floor(Math.random() * i);
            [songs[i], songs[j]] = [songs[j], songs[i]]
          }
          queue.songs = songs

          queue.textChannel.send(i18n.__mf({phrase: "shuffle.result", locale: guild.locale}, {author: user})
          )
            .catch(console.error)
          break

        case "⏹":
          reaction.users.remove(user).catch(console.error)
          if (!canModifyQueue(member)) return i18n.__({phrase: "common.errorNotChannel", locale: guild.locale})
          queue.songs = []
          queue.textChannel.send(i18n.__mf({phrase: "play.stopSong", locale: guild.locale}, {author: user})).catch(console.error)
          try {
            queue.connection.dispatcher.end()
          } catch (error) {
            console.error(error)
            queue.connection.disconnect()
          }
          collector.stop()
          break

        default:
          reaction.users.remove(user).catch(console.error)
          break
      }
    })

    collector.on("end", () => {
      playingMessage.reactions.removeAll().catch(console.error)
      if (PRUNING && playingMessage && !playingMessage.deleted) {
        playingMessage.delete({timeout: 3000}).catch(console.error)
      }
    })
  }
}