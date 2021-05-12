let config;

try {
  config = require("./../config.json");
} catch (error) {
  config = null;
}

exports.DC_TOKEN = config ? config.DC_TOKEN : process.env.DC_TOKEN;
exports.YT_API_KEY = config ? config.YT_API_KEY : process.env.YT_API_KEY;
exports.DATABASE_URL = config ? config.DATABASE_URL : process.env.DATABASE_URL;
exports.SERVER_IP = config ? config.SERVER_IP : false;
exports.TEST_SERVER = config ? config.TEST_SERVER : false;