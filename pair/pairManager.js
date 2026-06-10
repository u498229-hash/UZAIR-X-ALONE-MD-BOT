// ============================================
//       UZAIR MD BOT - PAIR CODE MANAGER
// ============================================

const config = require('../config/config');
const logger = require('../utils/logger');
const sessionManager = require('../core/session');

const pendingPairs  = new Map();
const activeSockets = new Map();

const pairManager = {

  setPending: (number, code) => {
    const clean  = number.replace(/[^0-9]/g, '');
    if (pendingPairs.has(clean)) clearTimeout(pendingPairs.get(clean).timer);

    const expiry = Date.now() + config.pairing.codeExpiry;
    const timer  = setTimeout(() => pairManager.expirePair(clean), config.pairing.codeExpiry);

    pendingPairs.set(clean, { code, expiry, timer, createdAt: Date.now() });
    logger.info(`Pair code stored for ${clean}`);
  },

  getPending: (number) => {
    const clean = number.replace(/[^0-9]/g, '');
    const data  = pendingPairs.get(clean);
    if (!data) return null;
    if (Date.now() > data.expiry) { pairManager.expirePair(clean); return null; }
    return data;
  },

  isValid: (number) => !!pairManager.getPending(number),

  expirePair: (number) => {
    const clean = number.replace(/[^0-9]/g, '');
    const data  = pendingPairs.get(clean);
    if (data) {
      clearTimeout(data.timer);
      pendingPairs.delete(clean);
      logger.warn(`Pair code expired for: ${clean}`);
      if (!activeSockets.has(clean)) {
        if (sessionManager.exists(clean)) sessionManager.delete(clean);
      }
    }
  },

  clearPair: (number) => {
    const clean = number.replace(/[^0-9]/g, '');
    const data  = pendingPairs.get(clean);
    if (data) { clearTimeout(data.timer); pendingPairs.delete(clean); }
    logger.success(`Pair cleared: ${clean}`);
  },

  setSocket:        (number, socket) => activeSockets.set(number.replace(/[^0-9]/g,''), socket),
  removeSocket:     (number)         => activeSockets.delete(number.replace(/[^0-9]/g,'')),
  getSocket:        (number)         => activeSockets.get(number.replace(/[^0-9]/g,'')) || null,
  getActiveSockets: ()               => activeSockets,
  isConnected:      (number)         => activeSockets.has(number.replace(/[^0-9]/g,'')),
  disconnectExisting:(number)        => {
    const clean = number.replace(/[^0-9]/g,'');
    const sock  = activeSockets.get(clean);
    if (sock) { try { sock.end(); } catch {} activeSockets.delete(clean); }
  },
  pendingCount: () => pendingPairs.size,
  activeCount:  () => activeSockets.size,
  getRemainingTime: (number) => {
    const data = pairManager.getPending(number);
    if (!data) return 0;
    return Math.max(0, Math.ceil((data.expiry - Date.now()) / 1000));
  },
};

module.exports = pairManager;
