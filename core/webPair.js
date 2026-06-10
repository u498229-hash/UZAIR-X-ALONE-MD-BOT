// ============================================
//    UZAIR MD BOT — WEB PAIR SYSTEM
// ============================================
'use strict';

const { startWhatsApp } = require('./whatsapp');
const pairManager = require('../pair/pairManager');

async function generatePairCode(number) {
  const clean = number.replace(/[^0-9]/g, '');

  // Already pending — return existing code
  const pending = pairManager.getPending(clean);
  if (pending) return pending.code;

  return new Promise(async (resolve, reject) => {
    try {
      // Start WhatsApp — website mode
      await startWhatsApp(clean);

      // Wait for pair code (max 30 seconds)
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const p = pairManager.getPending(clean);
        if (p) {
          clearInterval(interval);
          resolve(p.code);
        }
        if (attempts > 30) {
          clearInterval(interval);
          reject(new Error('Pair code timeout — dobara try karo'));
        }
      }, 1000);

    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { generatePairCode };
