'use strict';

let cachedApp;
let cachedDb;
let dbReadyPromise;

function missingEnvError() {
  const missing = [];
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_PUBLISHABLE_KEY) {
    missing.push('SUPABASE_ANON_KEY');
  }
  return missing.length ? missing : null;
}

function getAppAndDb() {
  if (!cachedDb) {
    cachedDb = require('../models');
  }
  if (!cachedApp) {
    cachedApp = require('../app');
  }
  return { app: cachedApp, db: cachedDb };
}

async function ensureDbReady() {
  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      console.log('[BOOT] Starting serverless function');
      console.log('[BOOT] NODE_ENV=', process.env.NODE_ENV);
      console.log('[BOOT] Has DATABASE_URL=', !!process.env.DATABASE_URL);
      const { db } = getAppAndDb();
      await db.sequelize.authenticate();
      await db.sequelize.sync();
      console.log('[BOOT] DB connected');
    })();
  }
  return dbReadyPromise;
}

module.exports = async (req, res) => {
  const missing = missingEnvError();
  if (missing) {
    return res.status(500).json({
      mensagem: 'Variáveis de ambiente em falta no servidor (Vercel)',
      missing,
    });
  }

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

  try {
    const { app } = getAppAndDb();
    return app(req, res);
  } catch (err) {
    console.error('❗ App load failure:', err?.stack || err);
    return res.status(500).json({
      mensagem: 'Falha ao carregar a aplicação',
      erro: err?.message || String(err),
    });
  }
};
