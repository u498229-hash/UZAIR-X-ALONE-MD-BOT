// ============================================
//      UZAIR  MD BOT — COMMANDS/MENU.JS
//      .menu Command — Full Command List
// ============================================

// ============================================
//      UZAIR  MD BOT — COMMANDS/MENU.JS
//      .menu Command — Full Command List
// ============================================

// ============================================
//      UZAIR  MD BOT — COMMANDS/MENU.JS
//      .menu Command — Full Command List
// ============================================

// ============================================
//      UZAIR  MD BOT — COMMANDS/MENU.JS
//      .menu Command — Full Command List
// ============================================

// ============================================
//      UZAIR  MD BOT — COMMANDS/MENU.JS
//      .menu Command — Full Command List
// ============================================

// ============================================
//      UZAIR  MD BOT — COMMANDS/MENU.JS
//      .menu Command — Full Command List
// ============================================

'use strict';

const fs      = require('fs');
const path    = require('path');
const config  = require('../config/config');
const db      = require('../database/db');

const run = async (ctx) => {
  const { sock, msg, from, botNum, isGroup, react, sender } = ctx;

  await react('⏳');

  // ─── Loading Animation ───
  if (isGroup) {
    const { key } = await sock.sendMessage(from, { text: '⚡ *UZAIR MD BOT* — BOOTING...' }, { quoted: msg });

    const frames = [
      { p: '20%',  b: '█░░░░░░░░░', s: '🔌 CONNECTING...'      },
      { p: '40%',  b: '███░░░░░░░', s: '📡 FETCHING DATA...'   },
      { p: '60%',  b: '█████░░░░░', s: '⚙️  PROCESSING...'      },
      { p: '80%',  b: '███████░░░', s: '🔐 SECURING...'         },
      { p: '100%', b: '██████████', s: '✅ READY TO SERVE!'     },
    ];

    for (const frame of frames) {
      const loadingText =
        `┏━━━━━━━━━━━━━━━━━━┓\n` +
        `┃  ⚡ UZAIR MD BOT  ┃\n` +
        `┃  ${frame.b} ${frame.p.padStart(4)}\n` +
        `┃  ${frame.s}\n` +
        `┗━━━━━━━━━━━━━━━━━━┛`;
      await sock.sendMessage(from, { edit: key, text: loadingText });
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  const prefix       = config.prefix;
  const time         = new Date().toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' });
  const date         = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Karachi' });
  const userName     = msg.pushName || 'User';
  const botMode      = db.getBotMode(botNum.replace(/[^0-9]/g, ''));
  const modeEmoji    = botMode === 'public' ? '🌍 PUBLIC' : '🔒 PRIVATE';

  // ─── User Number ───
  let userNumber = '';
  if (sender) {
    let raw = sender.split('@')[0].replace(/[^0-9]/g, '');
    if (raw.startsWith('92') && raw.length === 12)       userNumber = '0' + raw.slice(2);
    else if (raw.length === 11 && raw.startsWith('03'))  userNumber = raw;
    else if (raw.length === 10 && raw.startsWith('3'))   userNumber = '0' + raw;
    else                                                  userNumber = raw;
  }
  const displayNumber = userNumber || 'Unknown';

  const menuText =
`
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
☠️꧁༒ 𝑼𝒁𝑨𝑰𝑹 𝑴𝑫 𝑩𝑶𝑻 ༒꧂☠️
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
┃ 🤖 BOT  : UZAIR MD BOT
┃ 👤 USER : ${userName}
┃ 📱 NUM  : ${displayNumber}
┃ 👑 DEV  : ☠️ UZAIR ☠️
┃ ⚙️  MODE : ${modeEmoji}
┃ 🔑 PRE  : [ ${prefix} ]
┃ 🕐 TIME : ${time}
┃ 📅 DATE : ${date}
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

🔥 *Welcome ${userName}!*
⚡ *UZAIR MD BOT — Ready To Destroy!* 💀

╔════════════════════════════════
║          🎮 FF COMMANDS 🎮           
╠════════════════════════════════
║ 🎯 .ffinfo  — free fire ki Id lagao ues ki information Nikalo
║ 🏆 .ffrank  — Pakistan Leaderboard br rank 
╚════════════════════════════════


━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🛠️  *GENERAL COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
╔══════════════════════════════╗
║ 📋 .menu     — View full command list
║ 🏓 .ping     — Check bot response speed
║ 💚 .alive    — Check if bot is online
║ ℹ️  .info     — View complete bot information
║ ⏱️  .uptime   — Check how long bot has been running
║ ⚡ .speed    — Run internet speed test
║ 👑 .owner    — View owner contact info
║ 🔗 .pair     — Pair a new device with bot
╚══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👑  *OWNER COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
╔══════════════════════════════╗
║ 🔄 .mode        — Switch bot mode public/private
║ ➕ .addowner    — Add a new bot owner
║ ➖ .removeowner — Remove an existing owner
║ 🗑️  .antidelete  — Recover deleted messages
║ 💬 .chatbotdm   — Toggle chatbot in DMs
║ 👥 .chatbotgrp  — Toggle chatbot in groups
║ 📢 .broadcast   — Send message to all users
║ 🚫 .block       — Block a number from bot
║ ✅ .unblock     — Unblock a blocked number
║ 🔁 .restart     — Restart the bot
║ 💤 .afk         — Enable away from keyboard mode
║ 🔔 .pnotify     — Toggle private notifications
║ 🔕 .dnotify     — Toggle delete notifications
║ 🔒 .restrict    — Restrict group permissions
╚══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👥  *GROUP COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
╔══════════════════════════════╗
║ 👢 .kick       — Remove a member from group
║ ➕ .add        — Add a new member to group
║ ⬆️  .promote    — Promote member to admin
║ ⬇️  .demote     — Demote admin to member
║ 🔇 .mute       — Mute group (no messages)
║ 🔊 .unmute     — Unmute group
║ 📌 .tagall     — Tag all group members
║ 👻 .hidetag    — Tag all silently
║ ℹ️  .groupinfo  — View full group information
║ ✏️  .setname    — Change group name
║ 📝 .setdesc    — Change group description
║ 🖼️  .setppgc    — Change group profile picture
║ 🔗 .linkgc     — Get group invite link
║ 🔄 .revokegc   — Reset group invite link
║ 🚫 .antilink   — Block link sharing in group
║ ⚠️  .warn       — Warn a member
║ 🔄 .resetwarn  — Reset member warnings
║ 👋 .welcome    — Toggle welcome message
║ 👋 .bye        — Toggle goodbye message
╚══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎵  *MEDIA COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
╔══════════════════════════════╗
║ 🎵 .play    — Play audio from YouTube
║ 🎬 .video   — Play video from YouTube
║ 🎶 .song    — Download any song with name
║ 🎞️  .gif     — Download GIF
║ 🔄 .tomp3   — Convert video to mp3
╚══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎭  *STICKER COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
╔══════════════════════════════╗
║ 🎭 .sticker     — Convert image/video to sticker
║ 🖼️  .toimg       — Convert sticker to image
║ ℹ️  .stickerinfo — View sticker details
║ 😜 .emojimix    — Mix 2 emojis into sticker
╚══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📥  *DOWNLOADER COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
╔══════════════════════════════╗
║ ▶️  .ytmp3     — Download YouTube video as mp3
║ 📹 .ytmp4     — Download YouTube video
║ 🎵 .tiktok    — Download TikTok video without watermark
║ 📸 .instagram — Download Instagram post/reel
║ 📘 .facebook  — Download Facebook video
║ 🐦 .twitter   — Download Twitter/X video
║ 📦 .terabox   — Download Terabox files
║ 📱 .apk       — Download Android APK files
║ ✂️  .capcut    — Download CapCut video
║ 💾 .gdrive    — Download Google Drive files
║ 🔥 .mediafire — Download MediaFire files
║ 📌 .pinterest — Download Pinterest images
║ 📷 .qr        — Generate or scan QR code
╚══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔍  *SEARCH COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
╔══════════════════════════════╗
║ 🌐 .google    — Search anything on Google
║ 🌤️  .weather   — Get live weather of any city
║ 📖 .wiki      — Search Wikipedia articles
║ 🎵 .lyrics    — Find lyrics of any song
║ 🖼️  .image     — Search images on Google
║ 🖼️  .wallpaper — Download HD wallpapers
╚══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━
  😂  *FUN COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
╔══════════════════════════════╗
║ 😂 .joke     — Get a funny Urdu joke
║ 💬 .quote    — Get a motivational quote
║ 💡 .fact     — Get an interesting fact
║ 🎱 .8ball    — Ask the magic 8 ball anything
║ 😈 .dare     — Get a random dare challenge
║ 💯 .truth    — Get a truth question
║ 💘 .ship     — Check love % between 2 people
║ ⭐ .rate     — Rate anything out of 10
║ 💣 .boom     — Send a funny boom message
║ 💻 .hack     — Show fake hacking animation
║ 💌 .shayari  — Get sad/romantic/motivational shayari
║ 😜 .meme     — Get a random funny meme
╚══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔧  *UTILITY COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
╔══════════════════════════════╗
║ 🗣️  .tts       — Convert text to voice message
║ 🌍 .translate — Translate text to any language
║ 📷 .qr        — Generate QR code from text/link
║ 🔗 .shorturl  — Shorten a long URL
║ 🔄 .reverse   — Reverse any text
║ ✨ .fancy     — Convert text to stylish fonts
║ 👁️  .viewonce  — Save view once messages
║ 🆔 .getcid    — Get contact ID
║ 📱 .phoneinfo — Get basic phone number info
║ 📸 .ssweb     — Take screenshot of any website
║ 🪪 .jid       — View WhatsApp JID
║ 📊 .numberinfo— Get number information
║ 🔍 .tginfo    — View Telegram username info
║ ✅ .banchecker— Check if number is banned on WhatsApp
  .indiannumber indiannumber information 
╚══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🤖  *AI COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
╔══════════════════════════════╗
║ 🧠 .claude   — Chat with Claude AI full working ✌️
║ 🤖 .chatgpt  — Ask anything to ChatGPT
║ 🎨 .imagine  — Generate AI image from text
║ 💎 .gemini   — Chat with Google Gemini AI
║ 🌐 .meta     — Chat with Meta AI
║ 😈 .wormgpt  — Chat with WormGPT
║ 🖼️  .hd       — Enhance image to HD/4K quality
╚══════════════════════════════╝


▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
💀 Total Commands : 80+
⚡ Powered by : UZAIR DEV
🇵🇰 Made in Pakistan 🇵🇰
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

> ☠️ *𝑫𝑬𝑽𝑬𝑳𝑶𝑷𝑬𝑹 : 𝑼𝒁𝑨𝑰𝑹* ☠️`;

  const contextInfo = {
    forwardingScore: 999,
    isForwarded: true
  };

  const menuImagePath = path.resolve(config.assets.menuImage);
  const menuAudioPath = path.resolve(config.assets.menuAudio);

  if (fs.existsSync(menuImagePath)) {
    await sock.sendMessage(from, {
      image: fs.readFileSync(menuImagePath),
      caption: menuText,
      contextInfo: contextInfo
    }, { quoted: msg });
  } else {
    await sock.sendMessage(from, {
      text: menuText,
      contextInfo: contextInfo
    }, { quoted: msg });
  }

  if (fs.existsSync(menuAudioPath)) {
    await sock.sendMessage(from, {
      audio: fs.readFileSync(menuAudioPath),
      mimetype: 'audio/mp4',
      ptt: false,
    }, { quoted: msg });
  }

  await react('✅');
};

module.exports = { run };





