'use strict';

const app = require('../app');
const db = require("../models");

let dbReadyPromise;

async function ensureDbReady() {
  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      console.log('[BOOT] Starting serverless function');
      console.log('[BOOT] NODE_ENV=', process.env.NODE_ENV);
      console.log('[BOOT] Has DATABASE_URL=', !!process.env.DATABASE_URL);
      await db.sequelize.authenticate();
      await db.sequelize.sync();
      console.log('[BOOT] DB connected');
    })();
  }
  return dbReadyPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureDbReady();
  } catch (err) {
    console.error("❗ Cold start failure:", err?.stack || err);
    if (!res.headersSent) {
      return res.status(500).json({
        mensagem: 'Falha ao iniciar o servidor',
        erro: err?.message || String(err),
      });
    }
  }
  return app(req, res);
};
