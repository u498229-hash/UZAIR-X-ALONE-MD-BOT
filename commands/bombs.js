'use strict';
const games = new Map();

// ── Owner numbers (without +) ──
const OWNERS = [
  '+923312467635', // Owner 1 — +92 wala number yahan likho
  '+584161211770', // Owner 2 — +58 wala number yahan likho
];
const isOwner = (sender) => OWNERS.some(n => sender.includes(n));

const run = async (ctx) => {
  const { sock, msg, from, sender, body } = ctx;
  const timeout = 180000;

  if (games.has(sender)) {
    const g = games.get(sender);

    // ── Surrender ──
    if (['suren', 'surrender', 'choro', 'chordo'].includes(body?.toLowerCase().trim())) {
      const bomb = g.arr.find(v => v.e === '💥');
      clearTimeout(g.tid);
      games.delete(sender);
      return await sock.sendMessage(from, {
        text: `😔 *Tune Haar Maan Li!*\n\nBomb *Box ${bomb.n}* mein tha! 💥\n\nAgle baar aur dhyan se khelo! 😏`
      }, { quoted: g.msgKey });
    }

    const num = parseInt(body?.trim());
    if (isNaN(num) || num < 1 || num > 9) return;

    const box = g.arr.find(v => v.p === num);
    if (!box || box.opened) return;

    // ── OWNER logic: jo box owner ne choose kiya wahan bomb shift karo ──
    if (isOwner(sender) && box.e === '💥') {
      const safeUnopened = g.arr.filter(v => v.e === '✅' && !v.opened && v.p !== num);
      if (safeUnopened.length > 0) {
        const shift = safeUnopened[Math.floor(Math.random() * safeUnopened.length)];
        box.e = '✅';
        shift.e = '💥';
      }
    }

    // ── NORMAL USER logic: jo box user ne choose kiya wahan bomb force karo ──
    if (!isOwner(sender) && box.e === '✅') {
      // Bomb ko is box mein shift karo
      const bombBox = g.arr.find(v => v.e === '💥' && !v.opened);
      if (bombBox) {
        bombBox.e = '✅';
        box.e = '💥';
      }
    }

    box.opened = true;

    // ── Bomb mila ──
    if (box.e === '💥') {
      const taunts = [
        `😂 *HAHA! Tum Haar Gaye!*\nSeedha bomb pe haath rakh diya! Itni bhi aqal nahi thi? 🤣`,
        `💀 *BOOM! Game Over!*\nAre bhai pehle socha karo phir box khola karo 😂`,
        `🤣 *Wah Kya Dimag Hai!*\n9 mein se seedha bomb wala box! Kismat bhi saath nahi deti 😭`,
        `😈 *HAHA! Maar Diya Bomb Ne!*\nItne boxes the aur bomb hi dhundh liya! Legend ho tum 💀`,
        `🤡 *Oof! Bomb Pe Pair Rakh Diya!*\nAgle baar aankhein khol ke khelo bhai 😂`,
        `💥 *KABOOM! Udh Gaye!*\nBhai ek kaam dhang se nahi ho sakta kya? 😂 Game Over!`,
      ];
      const taunt = taunts[Math.floor(Math.random() * taunts.length)];
      let t = `💥 *BOOM! Bomb Mil Gaya!*\n\n`;
      t += `Box *${num}* mein bomb tha!\n\n`;
      for (let i = 0; i < g.arr.length; i += 3)
        t += g.arr.slice(i, i + 3).map(v => v.e).join('') + '\n';
      t += `\n${taunt}`;
      clearTimeout(g.tid);
      games.delete(sender);
      return await sock.sendMessage(from, { text: t }, { quoted: msg });
    }

    // ── Jeet gaye (sirf owner jeet sakta hai) ──
    const safe = g.arr.filter(v => v.e === '✅');
    if (safe.every(v => v.opened)) {
      let t = `🎉 *Waah! Tum Jeet Gaye!*\n\n`;
      t += `Tumne sab safe boxes khole aur bomb bachaya! 💪\n\n`;
      for (let i = 0; i < g.arr.length; i += 3)
        t += g.arr.slice(i, i + 3).map(v => v.e).join('') + '\n';
      t += `\n🏆 *Champion Bomb Defuser!*`;
      clearTimeout(g.tid);
      games.delete(sender);
      return await sock.sendMessage(from, { text: t }, { quoted: msg });
    }

    // ── Game jari ──
    const nums = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
    let t = `💣 *BOMB DEFUSE GAME*\n\n`;
    t += `Box ${num} khola: ✅ Safe!\n\n`;
    t += `Baaki boxes:\n`;
    for (let i = 0; i < g.arr.length; i += 3)
      t += g.arr.slice(i, i + 3).map(v => v.opened ? v.e : nums[v.p - 1]).join('') + '\n';
    t += `\n1-9 number bhejo agle box ke liye\nYa *suren* likh kar haar maan lo 😏`;
    return await sock.sendMessage(from, { text: t }, { quoted: msg });
  }

  // ── Naya game start ──
  const emojis = ['💥','✅','✅','✅','✅','✅','✅','✅','✅'].sort(() => Math.random() - 0.5);
  const nums = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
  const arr = emojis.map((e, i) => ({ e, n: nums[i], p: i + 1, opened: false }));

  let t = `💣 *BOMB DEFUSE GAME*\n\n`;
  t += `9 boxes mein se ek mein bomb chhupi hai! 💥\n`;
  t += `Baaki 8 safe hain ✅\n\n`;
  t += `Number bhejo box kholne ke liye:\n\n`;
  for (let i = 0; i < arr.length; i += 3)
    t += arr.slice(i, i + 3).map(v => v.n).join('') + '\n';
  t += `\n⏰ *Timeout: 3 minute*`;
  t += `\n😏 *suren* likh kar haar bhi maan sakte ho`;

  const sentMsg = await sock.sendMessage(from, { text: t }, { quoted: msg });

  const tid = setTimeout(async () => {
    if (games.has(sender)) {
      const bomb = games.get(sender).arr.find(v => v.e === '💥');
      games.delete(sender);
      await sock.sendMessage(from, {
        text: `⏰ *Time Up!*\n\nAre bhai so gaye kya? 😂\nBomb *Box ${bomb.n}* mein tha! 💥`
      });
    }
  }, timeout);

  games.set(sender, { arr, msgKey: sentMsg, tid });
};

module.exports = { name: "bomb", run };

