'use strict';
const db = require('../database/db');

const activeTimers = new Map();

const run = async (ctx) => {
  const { sock, msg, from, args, isGroup, isAdmin, isBotAdmin } = ctx;

  if (!isGroup) return sock.sendMessage(from, { text: '❌ Sirf group mein use karo!' }, { quoted: msg });
  if (!isAdmin) return sock.sendMessage(from, { text: '❌ Yeh command sirf *group admins* ke liye hai!' }, { quoted: msg });
  if (!isBotAdmin) return sock.sendMessage(from, { text: '❌ Bot ko *admin* banao pehle!' }, { quoted: msg });

  if (args[0]?.toLowerCase() === 'off') {
    if (activeTimers.has(from)) {
      clearTimeout(activeTimers.get(from));
      activeTimers.delete(from);
    }
    if (db.updateGroupSettings) db.updateGroupSettings(from, { autoopen: false, autoopenTime: null });
    return sock.sendMessage(from, { text: '✅ Auto Open *OFF* ho gaya!' }, { quoted: msg });
  }

  const timeStr = args.join(' ').trim();
  const parsed = parseTime(timeStr);

  if (!parsed) {
    const pkTime = getPKTime();
    return sock.sendMessage(from, {
      text: `🔓 *AUTO OPEN*\n\nGroup ko automatically kholo!\n🇵🇰 Pakistan Time: *${pkTime}*\n\n*Usage:*\n.autoopen 7:00 am\n.autoopen 8:30 am\n.autoopen 07:00\n.autoopen off`
    }, { quoted: msg });
  }

  if (activeTimers.has(from)) {
    clearTimeout(activeTimers.get(from));
    activeTimers.delete(from);
  }

  const delay = getDelayMsPK(parsed.h, parsed.m);
  const delayHours = Math.floor(delay / 3600000);
  const delayMins = Math.floor((delay % 3600000) / 60000);

  const timer = setTimeout(async () => {
    try {
      await sock.groupSettingUpdate(from, 'not_announcement');
      await sock.sendMessage(from, {
        text: `🔓 Group automatically khul gaya!\n⏰ Pakistan Time: *${parsed.display}*\n\nBand karne ke liye: .autoclose`
      });
      activeTimers.delete(from);
    } catch (e) {}
  }, delay);

  activeTimers.set(from, timer);
  if (db.updateGroupSettings) db.updateGroupSettings(from, { autoopen: true, autoopenTime: parsed.time24 });

  return sock.sendMessage(from, {
    text: `✅ Auto Open *ON*!\n\n🇵🇰 Group khulega: *${parsed.display}* (Pakistan Time)\n⏳ Time remaining: ${delayHours}h ${delayMins}m\n\nCancel: .autoopen off`
  }, { quoted: msg });
};

function getPKTime() {
  return new Date().toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hour12: true });
}

function parseTime(str) {
  if (!str) return null;
  const ampmMatch = str.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  const hr24Match = str.match(/^(\d{1,2}):(\d{2})$/);

  if (ampmMatch) {
    let h = parseInt(ampmMatch[1]);
    const m = parseInt(ampmMatch[2]);
    const period = ampmMatch[3].toLowerCase();
    if (period === 'pm' && h !== 12) h += 12;
    if (period === 'am' && h === 12) h = 0;
    if (h > 23 || m > 59) return null;
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return { h, m, time24: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, display: `${h12}:${String(m).padStart(2,'0')} ${period.toUpperCase()}` };
  }

  if (hr24Match) {
    const h = parseInt(hr24Match[1]);
    const m = parseInt(hr24Match[2]);
    if (h > 23 || m > 59) return null;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return { h, m, time24: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, display: `${h12}:${String(m).padStart(2,'0')} ${period}` };
  }
  return null;
}

function getDelayMsPK(h, m) {
  const now = new Date();
  const pkOffset = 5 * 60;
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
  const pkNow = new Date(utcNow + pkOffset * 60000);

  const target = new Date(pkNow);
  target.setHours(h, m, 0, 0);
  if (target <= pkNow) target.setDate(target.getDate() + 1);

  return target - pkNow;
}

module.exports = { name: "autoopen", run };


