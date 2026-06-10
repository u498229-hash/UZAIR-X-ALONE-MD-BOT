/**
 * SIM Database Lookup Command
 * COMMAND: .siminfo
 * USAGE: .siminfo <mobile number or CNIC>
 * EXAMPLES: .siminfo 03018787786 | .siminfo 3520112345678
 */

/**
 * SIM Database Lookup Command
 * Updated API Endpoint
 */

'use strict';

const axios = require('axios');

module.exports = {
  name: 'indiannumber',
  async execute(sock, msg, args, extra) {
    const { react, reply, from } = extra;

    try {
      if (!args.length) return reply(`❌ *Number enter karein.*\n📌 *Example:* .indiannumber 8123456789`);

      await react('⏳');

      const raw = args.join('').replace(/\D/g, '');
      // Aapki API URL
      const apiUrl = `https://all-number-info-rajan-eta.vercel.app/api?number=${encodeURIComponent(raw)}`;
      
      const response = await axios.get(apiUrl);
      
      // JSON structure ke mutabiq sahi path tak pahunchna
      const records = response.data?.results?.source_2?.data?.data || [];

      if (records.length === 0) {
        await react('❌');
        return reply(`🚫 *No Record Found for:* ${raw}`);
      }

      let replyText = `🇮🇳 *Indian Number Info*\n📊 *Total Found:* ${records.length}\n\n`;

      // Sirf top 5 results dikhayenge taaki message spam na ho
      records.slice(0, 5).forEach((rec, i) => {
        replyText += `*Result ${i + 1}:*\n` +
                     `👤 *Name:* ${rec.NAME || "N/A"}\n` +
                     `👨 *Father:* ${rec.fname || "N/A"}\n` +
                     `📱 *Mobile:* ${rec.MOBILE || raw}\n` +
                     `📍 *Address:* ${rec.ADDRESS || "N/A"}\n` +
                     `📡 *Circle:* ${rec.circle || "N/A"}\n\n`;
      });

      replyText += `━━━━━━━━━━━━━━━━━━━\n` +
                   `⚠️ *Educational Purpose Only*`;

      await sock.sendMessage(from, { text: replyText }, { quoted: msg });
      await react('✅');
      
    } catch (error) {
      await reply(`❌ *Error:* ${error.message}`);
      await react('❌');
    }
  }
};


