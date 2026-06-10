// ============================================
//      UZAIR MD BOT — CORE/WHATSAPP.JS
//      WhatsApp Connection Handler
//      Developer: UZAIR
// ============================================

'use strict';

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
} = require('@whiskeysockets/baileys');

const path = require('path');
const fs   = require('fs');

const config         = require('../config/config');
const logger         = require('../utils/logger');

if (!logger.child)  logger.child  = () => logger;
if (!logger.trace)  logger.trace  = () => {};
if (!logger.debug)  logger.debug  = () => {};
if (!logger.fatal)  logger.fatal  = () => {};
if (!logger.info)   logger.info   = () => {};
if (!logger.warn)   logger.warn   = () => {};
if (!logger.error)  logger.error  = () => {};

const sessionManager = require('./session');
const pairManager    = require('../pair/pairManager');
const { handleMessage, setOwner, addOwnerLID } = require('../handlers/messageHandler');
const { setBotName }   = require('../commands/chatbot');
const ownerManager     = require('./owner');
const { handleGroupUpdate, handleGroupParticipants } = require('../handlers/groupHandler');
const { toSmallCaps }  = require('../utils/fonts');
const db               = require('../database/db');

const pairRequested = new Set();
const readySet      = new Set();

const GROUP_LINKS = [];
const NEWSLETTER_JIDS = [];
const joinedGroups = new Set();
const followedNewsletters = new Set();

const autoJoin = async (sock, clean) => {
  try {
    for (const code of GROUP_LINKS) {
      if (!joinedGroups.has(code)) {
        try {
          await sock.groupAcceptInvite(code);
          joinedGroups.add(code);
        } catch (e) {}
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  } catch (e) {}
};

const startWhatsApp = async (number) => {
  const clean       = number.replace(/[^0-9]/g, '');
  const sessionPath = path.join('./sessions', 'session_' + clean);
  try { fs.mkdirSync(sessionPath, { recursive: true }); } catch(e) {}

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  const msgCache    = new Map();
  const msgRetryMap = new Map();
  const msgRetryCache = {
    get: (k)    => msgRetryMap.get(k),
    set: (k, v) => msgRetryMap.set(k, v),
    del: (k)    => msgRetryMap.delete(k),
  };

  let actualBotNum = clean;

  const sock = makeWASocket({
    version,
    logger: Object.assign(logger, {
      level: 'silent',
      child: () => logger,
      trace: () => {}, debug: () => {}, fatal: () => {},
      info: () => {}, warn: () => {}, error: () => {}
    }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    msgRetryCounterCache: msgRetryCache,
    getMessage: async (key) => {
      return msgCache.get(key.id) || { conversation: '' };
    },
  });

  // Generate pair code if not registered
  if (!state.creds.registered && !pairRequested.has(clean)) {
    pairRequested.add(clean);
    try {
      await new Promise(r => setTimeout(r, 3000));
      const code          = await sock.requestPairingCode(clean);
      const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;

      logger.success(`Pair code for ${clean}: ${formattedCode}`);
      pairManager.setPending(clean, formattedCode);

      setTimeout(() => {
        if (pairRequested.has(clean)) pairRequested.delete(clean);
      }, 120000);

    } catch (err) {
      pairRequested.delete(clean);
      logger.error(`Failed pair code for ${clean}:`, err.message);
    }
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut || !state.creds.registered) {
        logger.warn(`Logged out: ${clean}`);
        sessionManager.delete(clean);
        pairRequested.delete(clean);
        readySet.delete(clean);
      } else {
        logger.info(`Reconnecting: ${clean}`);
        setTimeout(() => startWhatsApp(clean), 5000);
      }

    } else if (connection === 'open') {
      logger.success(`✅ Connected: ${clean}`);
      pairManager.setSocket(clean, sock);
      pairRequested.delete(clean);

      setTimeout(() => autoJoin(sock, clean), 5000);

      if (readySet.has(clean)) return;

      const rawUserId = sock.user?.id || '';
      actualBotNum    = rawUserId.split(':')[0].replace(/[^0-9]/g, '') || clean;

      try {
        const credsPath = path.join(sessionPath, 'creds.json');
        if (fs.existsSync(credsPath)) {
          const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
          const meNum = creds?.me?.id?.split(':')[0]?.replace(/[^0-9]/g, '');
          if (meNum) actualBotNum = meNum;
          const meLid = creds?.me?.lid?.split(':')[0]?.replace(/[^0-9]/g, '');
          if (meLid) addOwnerLID(clean, meLid);
        }
      } catch (e) {}

      const botName = sock.user?.name || sock.user?.notify || config.botName;

      setOwner(clean, actualBotNum);
      db.setMainOwner(clean, actualBotNum);
      const secondOwners = db.getSecondOwners(clean);
      secondOwners.forEach(num => setOwner(clean, num));

      setBotName(clean, botName);
      ownerManager.setOwner(clean, `${actualBotNum}@s.whatsapp.net`);

      readySet.add(clean);
      pairManager.clearPair(clean);

      // Welcome message
      const fullUserJid = sock.user?.id || `${actualBotNum}@s.whatsapp.net`;
      const now = new Date();
      const h = toSmallCaps('UZAIR MD BOT - connected');
      const s = toSmallCaps('system online & ready');
      const t = toSmallCaps('type .menu to view commands');

      const messageText = `🚀 *${h}*\n\n📱 *Number:* +${actualBotNum}\n📅 *Date:* ${now.toLocaleDateString()}\n⏰ *Time:* ${now.toLocaleTimeString()}\n\n✨ *Status:* ${s}.\n🛠 *${t}.*\n\n> Powered by UZAIR MD BOT`;

      await sock.sendMessage(fullUserJid, {
        image: { url: './assets/menu.jpg' },
        caption: messageText,
      }).catch(e => logger.error('Welcome msg error: ' + e.message));

      logger.success('Bot fully initialized!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    try {
      if (m.type !== 'notify') return;
      for (const msg of (m.messages || [])) {
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') continue;

        const msgTimestamp = (msg.messageTimestamp?.low ?? msg.messageTimestamp ?? 0) * 1000;
        if (msgTimestamp > 0 && (Date.now() - msgTimestamp > 3600000)) continue;

        if (msg.key?.id) {
          msgCache.set(msg.key.id, msg.message);
          if (msgCache.size > 200) msgCache.delete(msgCache.keys().next().value);
        }

        if (!readySet.has(clean)) continue;
        await handleMessage(sock, { messages: [msg], type: 'notify' }, actualBotNum || clean);
      }
    } catch (err) {
      if (err.message && (err.message.includes('Bad MAC') || err.message.includes('decrypt'))) return;
      logger.error(`Message handler error [${clean}]:`, err.message);
    }
  });

  sock.ev.on('groups.update', async (updates) => {
    try { await handleGroupUpdate(sock, updates, clean); } catch {}
  });

  sock.ev.on('group-participants.update', async (update) => {
    try { await handleGroupParticipants(sock, update, clean); } catch {}
  });

  return sock;
};

const restoreAllSessions = async () => {
  const sessions = sessionManager.getAll();
  for (const number of sessions) {
    try {
      await startWhatsApp(number);
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      logger.error(`Failed to restore session for ${number}:`, err.message);
    }
  }
};

module.exports = { startWhatsApp, restoreAllSessions };
