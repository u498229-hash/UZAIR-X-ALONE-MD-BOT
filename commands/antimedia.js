'use strict';

// ── Original run function ──
'use strict';
const db = require('../database/db');
const run = async (ctx) => {
  const { sock, msg, from, args, isGroup } = ctx;
  if (!isGroup) return await sock.sendMessage(from, { text: '❌ Group mein use karo!' }, { quoted: msg });
  const opt = args[0]?.toLowerCase();
  const s = db.getGroupSettings ? db.getGroupSettings(from) : {};
  if (!opt || !['on','off'].includes(opt))
    return await sock.sendMessage(from, { text: `🖼️ *Anti Media:* ${s.antimedia ? 'ON ✅' : 'OFF ❌'}\n\nUsage: .antimedia on/off\n\nGroup mein images/videos band ho jaenge.` }, { quoted: msg });
  if (db.updateGroupSettings) db.updateGroupSettings(from, { antimedia: opt === 'on' });
  await sock.sendMessage(from, { text: `✅ Anti media *${opt.toUpperCase()}* ho gaya!` }, { quoted: msg });
};
module.exports = { run };

// ── Dynamic Plugin Wrapper ──
module.exports = {
  name: 'antimedia',
  aliases: [],
  category: 'plugin',
  description: 'antimedia command',
  usage: '.antimedia',
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
