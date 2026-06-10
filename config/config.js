// ============================================
//       UZAIR MD BOT - MAIN CONFIGURATION
// ============================================

const config = {

  botName:     'UZAIR MD BOT',
  ownerNumber: '923013050530',
  developer:   'UZAIR',
  prefix:      '.',
  version:     '1.0.0',

  channels: {
    channel1: 'https://whatsapp.com/channel/0029Vb8RxyXDJ6GwMHiMYi1E',
    channel2: 'https://whatsapp.com/channel/0029Vb8RxyXDJ6GwMHiMYi1E',
  },

  pairing: {
    codeExpiry: 120000,
    maxRetries: 3,
  },

  sessions: {
    dir:          './sessions',
    cleanupDelay: 5000,
  },

  database: {
    path: './database/data.json',
  },

  behavior: {
    antiCrash:            true,
    autoRead:             false,
    autoTyping:           true,
    autoRecording:        false,
    deleteCommandMessage: false,
    rejectCalls:          false,
    rejectCallMessage:    '❌ Calls are not accepted on this bot.',
  },

  rateLimit: {
    maxCommands: 10,
    windowMs:    10000,
  },

  logLevel: 'info',
  port:     process.env.PORT || 3000,

  assets: {
    menuImage: './assets/menu.jpg',
    menuAudio: './assets/menu.mp3',
  },

};

module.exports = config;
