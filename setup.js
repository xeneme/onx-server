var readline = require("readline");
var fs = require("fs");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const props = {
  COINBASE_KEY: "CoinBase API key",
  COINBASE_SECRET: "CoinBase API secret",
  NAMECHEAP_API_KEY: "Namecheap API key",
  NAMECHEAP_API_USER: "Никнейм в Namecheap",
  CLOUDFLARE_API_KEY: "CloudFlare API key",
  CLOUDFLARE_EMAIL: "Email в Cloudflare",
  SECRET: "Придумай кодовую фразу",
  DB_URI: "MongoDB URI",
  BOT_TOKEN: "Telegram Bot API key",
  SUPPORT_PASS: "Единый пароль от почтовых ящиков саппорта",
  OWNER: "Email владельца",
};

console.log("Заполнение конфига...\n");

const readLine = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt + ": ", (val) => {
      resolve(val);
    });
  });
};

async function main() {
  const cfg = {};

  for(let [key, prompt] of Object.entries(props)) {
    cfg[key] = await readLine(prompt);
  }

  rl.close();

  const parsed = Object.entries(cfg)
    .map(([key, val]) => key + " = " + val)
    .join("\n");

  fs.writeFile(".env", 'PORT = 80\n' + parsed, () => {
    console.log("\Сервер готов к запуску.\n");
  });
}

main();
