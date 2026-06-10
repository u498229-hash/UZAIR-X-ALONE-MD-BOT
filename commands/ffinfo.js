/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Fixed By UZAIR
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Fixed By UZAIR
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Fixed By UZAIR
 * API: freefireinfo-zy9l.onrender.com (FREE - No Key Required)
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Fixed By UZAIR
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Fixed By UZAIR
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Updated By UZAIR MD BOT
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Fixed By UZAIR
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Fixed By UZAIR
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Fixed By UZAIR
 * API: freefireinfo-zy9l.onrender.com (FREE - No Key Required)
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Fixed By UZAIR
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Fixed By UZAIR
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Updated By UZAIR MD BOT
 */

/**
 * Free Fire Player Info Command
 * COMMAND: .ffinfo
 * USAGE: .ffinfo <UID>
 * Fixed By UZAIR MD BOT
 */

'use strict';

const axios           = require('axios');
const { toSmallCaps } = require('../utils/fonts');
const logger          = require('../utils/logger');

// ─── API CONFIG ───────────────────────────────────────────────────────────────
const FF_API      = 'https://ff-info-api-xyz.vercel.app/api/Flex-ff-Info';
const BANNER_API  = 'https://apisaqib.vercel.app/api/v1/1094';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const safe = (v, fallback = 'N/A') => (v !== undefined && v !== null && v !== '') ? v : fallback;

const formatDate = (ts) => {
  if (!ts) return 'N/A';
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', hour12: true,
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }) + ' (IST)';
};

const brRankLabel = (pts) => {
  pts = Number(pts) || 0;
  if (pts >= 8000) return `Elite Heroic V (${pts})`;
  if (pts >= 6000) return `Heroic II (${pts})`;
  if (pts >= 5000) return `Heroic I (${pts})`;
  if (pts >= 4000) return `Diamond III (${pts})`;
  if (pts >= 3000) return `Diamond II (${pts})`;
  if (pts >= 2000) return `Diamond I (${pts})`;
  if (pts >= 1500) return `Platinum III (${pts})`;
  if (pts >= 1000) return `Gold II (${pts})`;
  return `Bronze (${pts})`;
};

const csRankLabel = (stars) => {
  stars = Number(stars) || 0;
  if (stars >= 100) return `Elite Master (${stars} Star)`;
  if (stars >= 80)  return `Master (${stars} Star)`;
  if (stars >= 60)  return `Diamond (${stars} Star)`;
  if (stars >= 40)  return `Platinum (${stars} Star)`;
  return `Gold (${stars} Star)`;
};

const firePassLabel = (fp) => (!fp || fp === '0' || fp === 0) ? 'Basic' : 'Elite';
const genderLabel   = (g)  => g === 1 || g === '1' ? 'Male' : g === 2 || g === '2' ? 'Female' : 'N/A';

module.exports = {
  name: 'ffinfo',
  aliases: ['freefire', 'ff', 'ffplayer'],
  category: 'tools',
  description: '🎮 Free Fire player info by UID',
  usage: '.ffinfo <UID>',

  async execute(sock, msg, args, extra) {
    const { reply, react, from } = extra;

    const uid    = args?.[0]?.trim() || '';
    const region = (args?.[1]?.toUpperCase() || 'PK');

    if (!uid) {
      return reply(
        `❌ *UID do!*\n\n` +
        `📌 *Usage:* .ffinfo <UID>\n` +
        `💡 *Example:* .ffinfo 6984888313\n` +
        `💡 *Region:* .ffinfo 6984888313 IND`
      );
    }

    if (!/^\d{9,12}$/.test(uid)) {
      return reply(`❌ *Invalid UID!*\nUID sirf 9-12 digits ka hota hai.\n\n💡 Example: .ffinfo 6984888313`);
    }

    try {
      try { await react('⏳'); } catch (_) {}

      // ── Fetch player info ─────────────────────────────────────────────────
      const regions = ['PK', 'IND', 'SG', 'BR'];

      let data = null;
      let usedRegion = '';

      for (const reg of regions) {
        try {
          const res = await axios.get(FF_API, {
            params: { region: reg, uid },
            timeout: 20000,
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          const d = res.data;
          if (d && (d.captainBasicInfo?.nickname || d.basicInfo?.nickname)) {
            data = d;
            usedRegion = reg;
            break;
          }
        } catch (e) {
          logger.warn(`FF region ${reg} failed: ${e.message}`);
        }
      }

      if (!data) {
        return reply(
          `❌ *Player Not Found!*\n\n🆔 UID: ${uid}\n\n` +
          `• UID sahi hai?\n• Region try karo: .ffinfo ${uid} IND`
        );
      }

      // ── Parse data ────────────────────────────────────────────────────────
      const cb  = data.captainBasicInfo || data.basicInfo || {};
      const pi  = data.profileInfo      || {};
      const cl  = data.clanBasicInfo    || {};
      const cap = data.captainInfo      || {};
      const pet = data.petInfo          || {};

      const name       = safe(cb.nickname);
      const level      = safe(cb.level);
      const exp        = Number(cb.exp    || 0).toLocaleString();
      const likes      = Number(cb.liked  || 0).toLocaleString();
      const regionOut  = safe(cb.region   || usedRegion);
      const honorScore = safe(cb.honorScore, '100');
      const celebrity  = cb.isCelebrity ? 'True' : 'False';
      const titleName  = safe(cb.title, 'Not Found');
      const signature  = safe(cb.signature, 'N/A');
      const primeLevel = safe(cb.primeLevel, '1');
      const createdAt  = formatDate(cb.createAt);
      const lastLogin  = formatDate(cb.lastLoginAt);
      const obVersion  = safe(cb.releaseVersion, 'N/A');
      const firePass   = firePassLabel(cb.firePass);
      const bpBadges   = safe(cb.badgeCnt, '0');
      const brPts      = cb.rankingPoints || 0;
      const csStar     = cb.csRank        || 0;
      const gender     = genderLabel(cb.gender);
      const showBrRank = cb.showBrRank !== false ? 'True' : 'False';
      const showCsRank = cb.showCsRank !== false ? 'True' : 'False';
      const showRank   = safe(cb.showRank, 'BrRanked');
      const avatarId   = safe(pi.avatarId  || cb.headPic, 'Default');
      const bannerId   = safe(cb.bannerId, 'Default');
      const pinId      = safe(cb.pinId, 'Default');
      const language   = safe(cb.language, 'English');
      const modePrefer = safe(cb.modePrefer, 'No Preference');

      // Skills
      let skillsText = 'N/A';
      if (pi.equipedSkills && Array.isArray(pi.equipedSkills)) {
        skillsText = pi.equipedSkills.join(', ');
      }

      // Pet
      const petEquipped = pet.petId ? 'Yes' : 'No';
      const petName     = safe(pet.petName, 'N/A');
      const petType     = safe(pet.petType, 'N/A');
      const petExp      = safe(pet.exp,     '0');
      const petLevel    = safe(pet.level,   '1');

      // Guild
      const guildName   = safe(cl.clanName,   'No Guild');
      const guildId     = safe(cl.clanId,     'N/A');
      const guildLevel  = safe(cl.clanLevel,  'N/A');
      const liveMembers = safe(cl.memberNum,  'N/A');
      const maxMembers  = safe(cl.capacity,   '50');

      // Leader
      const lName      = safe(cap.nickname,    'N/A');
      const lUid       = safe(cap.accountId,   'N/A');
      const lLevel     = safe(cap.level,       'N/A');
      const lExp       = Number(cap.exp || 0).toLocaleString();
      const lRegion    = safe(cap.region,      'N/A');
      const lFirePass  = firePassLabel(cap.firePass);
      const lCreated   = formatDate(cap.createAt);
      const lLastLogin = formatDate(cap.lastLoginAt);
      const lOb        = safe(cap.releaseVersion, 'N/A');
      const lTitle     = safe(cap.title,       'N/A');
      const lBadges    = safe(cap.badgeCnt,    '0');
      const lBrPts     = cap.rankingPoints     || 0;
      const lCsStar    = cap.csRank            || 0;

      // ── Build text ────────────────────────────────────────────────────────
      const info =
`*🎮 FREE FIRE PLAYER INFO*
━━━━━━━━━━━━━━━━━━━━━━
┌ *Account Information:*
├ *Basic Information:*
├─ Prime Level: ${primeLevel}
├─ Name: ${name}
├─ UID: ${uid}
├─ Level: ${level} (Exp: ${exp})
├─ Region: ${regionOut}
├─ Likes: ${likes}
├─ Honor Score: ${honorScore}
├─ Celebrity Status: ${celebrity}
├─ Title Name: ${titleName}
└─ Signature: ${signature}

┌ *Activity Information:*
├─ Most Recent OB: ${obVersion}
├─ Fire Pass: ${firePass}
├─ Current Bp Badges: ${bpBadges}
├─ Br Rank: ${brRankLabel(brPts)}
├─ Cs Rank: ${csRankLabel(csStar)}
├─ Gender: ${gender}
├─ Show Rank: ${showRank}
├─ Show Br Rank: ${showBrRank}
├─ Show Cs Rank: ${showCsRank}
├─ Created At: ${createdAt}
└─ Last Login: ${lastLogin}

┌ *Overview Information:*
├─ Avatar ID: ${avatarId}
├─ Banner ID: ${bannerId}
├─ Pin ID: ${pinId}
├─ Active Time: Flexible
├─ Active Days: Flexible
├─ Mode Prefer: ${modePrefer}
├─ Equipped Skills: ${skillsText}
├─ Language: ${language}
├─ Equipped Battle Card ID: Not Equipped
├─ Equipped Gun ID: Not Equipped
├─ Equipped Animation ID: Not Equipped
├─ Transform Animation ID: Not Equipped
└─ Outfits: Graphically Presented Below

┌ *Pet Details:*
├─ Equipped?: ${petEquipped}
├─ Pet Name: ${petName}
├─ Pet Type: ${petType}
├─ Pet Exp: ${petExp}
└─ Pet Level: ${petLevel}

┌ *Guild Information:*
├─ Guild Name: ${guildName}
├─ Guild ID: ${guildId}
├─ Guild Level: ${guildLevel}
├─ Live Members: ${liveMembers}/${maxMembers}
└─ Leader Information:
    ├─ Leader Name: ${lName}
    ├─ Leader UID: ${lUid}
    ├─ Leader Level: ${lLevel} (Exp: ${lExp})
    ├─ Leader Region: ${lRegion}
    ├─ Leader Fire Pass: ${lFirePass}
    ├─ Leader Created At: ${lCreated}
    ├─ Leader Last Login: ${lLastLogin}
    ├─ Leader Most Recent OB: ${lOb}
    ├─ Leader Title Name: ${lTitle}
    ├─ Leader Current Bp Badges: ${lBadges}
    ├─ Leader Br Rank: ${brRankLabel(lBrPts)}
    └─ Leader Cs Rank: ${csRankLabel(lCsStar)}

┌ *Public Craftland Maps*
Not Found
━━━━━━━━━━━━━━━━━━━━━━
        _ʙʏ UZAIR MD BOT_`;

      // ── Fetch banner image ────────────────────────────────────────────────
      let imageSent = false;

      // Primary: apisaqib API (uid se banner generate karta hai)
      const bannerApis = [
        () => axios.get(BANNER_API, {
          params:       { uid },
          responseType: 'arraybuffer',
          timeout:      25000,
          headers:      { 'User-Agent': 'Mozilla/5.0' },
        }),
        // Fallback: freefireinfo render API
        () => axios.get(`https://freefireinfo-zy9l.onrender.com/api/v1/player-banner`, {
          params:       { uid },
          responseType: 'arraybuffer',
          timeout:      25000,
          headers:      { 'User-Agent': 'Mozilla/5.0' },
        }),
      ];

      for (const fetchBanner of bannerApis) {
        if (imageSent) break;
        try {
          const imgRes = await fetchBanner();
          const size   = imgRes.data?.byteLength || 0;
          logger.info(`Banner status: ${imgRes.status} | size: ${size}`);

          if (imgRes.status === 200 && size > 100) {
            const buf  = Buffer.from(imgRes.data);
            const mime = imgRes.headers['content-type']?.split(';')[0] || 'image/jpeg';

            await sock.sendMessage(from, {
              image:    buf,
              caption:  info,
              mimetype: mime,
            }, { quoted: msg });

            imageSent = true;
          }
        } catch (imgErr) {
          logger.warn(`Banner API failed: ${imgErr.message}`);
        }
      }

      // Fallback: sirf text
      if (!imageSent) {
        await reply(info);
      }

      try { await react('✅'); } catch (_) {}

    } catch (error) {
      logger.error('FF Info Error:', error.message);
      await reply(`❌ *Error:* ${error.message}\n\nDobara try karo!`);
      try { await react('❌'); } catch (_) {}
    }
  }
};












