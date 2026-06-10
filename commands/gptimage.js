'use strict';

// ── Original run function ──
'use strict';
const axios = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const run = async (ctx) => {
  const { sock, msg, from, args } = ctx;
  const prompt = args.join(' ').trim();
  if (!prompt) return await sock.sendMessage(from, { text: '❌ Usage: .gptimage <prompt> (image reply karo)\nExample: .gptimage add sunset background' }, { quoted: msg });
  const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
  if (!ctxInfo?.quotedMessage?.imageMessage) return await sock.sendMessage(from, { text: '📷 Kisi image ko reply karo .gptimage se!' }, { quoted: msg });
  try {
    await sock.sendMessage(from, { react: { text: '🖼️', key: msg.key } });
    const target = { key: { remoteJid: from, id: ctxInfo.stanzaId, participant: ctxInfo.participant }, message: ctxInfo.quotedMessage };
    const buf = await downloadMediaMessage(target, 'buffer', {}, { logger: undefined, reuploadRequest: sock.updateMediaMessage });
    const form = new FormData();
    form.append('image', buf, { filename: 'image.jpg', contentType: 'image/jpeg' });
    form.append('prompt', prompt);
    const res = await axios.post('https://api.siputzx.my.id/api/ai/gpt-image', form, { headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 60000 });
    await sock.sendMessage(from, { image: Buffer.from(res.data), caption: `🖼️ *GPT Image*\n\n📝 ${prompt}` }, { quoted: msg });
    await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
  }
};
module.exports = { run };

// ── Dynamic Plugin Wrapper ──
module.exports = {
  name: 'gptimage',
  aliases: [],
  category: 'plugin',
  description: 'gptimage command',
  usage: '.gptimage',
  async execute(sock, msg, args, extra) {
    const ctx = {
      sock,
      msg,
      from: extra.from,
      sender: extra.sender,
      args,
      isOwner: extra.isOwner,
      isGroup: extra.isGroup,
      isAdmin: extra.isAdmin,
      botNum: extra.botNum,
      reply: extra.reply,
      react: extra.react,
      config: extra.config,
    };
    await run(ctx);
  }
};
