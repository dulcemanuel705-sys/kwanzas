'use strict';

const app = require('../app');
const db = require("../models");

let dbReadyPromise;

async function ensureDbReady() {
  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      await db.sequelize.authenticate();
      await db.sequelize.sync();
    })();
  }
  return dbReadyPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureDbReady();
  } catch (err) {
    console.error("❗ Falha ao conectar ao DB:", err?.message || err);
  }
  return app(req, res);
};
