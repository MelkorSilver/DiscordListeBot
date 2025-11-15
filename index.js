require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Events } = require("discord.js");
const fs = require("fs");

const CONFIG_FILE = "./config.json";

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  } catch {
    return { listChannelId: null, listMessageId: null };
  }
}

function saveConfig(data) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), "utf8");
}

let config = loadConfig();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel]
});

client.once(Events.ClientReady, () => {
  console.log(`Bot giriş yaptı: ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;

  const content = msg.content.trim();

  // -----------------
  // Listeyi ayarlama
  // -----------------
  if (content === "!liste-ayarla") {
    if (!msg.reference?.messageId) {
      return msg.reply("Bu komutu **liste mesajına cevap atarak** kullanmalısın.");
    }

    config.listChannelId = msg.channel.id;
    config.listMessageId = msg.reference.messageId;

    saveConfig(config);

    return msg.reply("✅ Liste mesajı kaydedildi!");
  }

  // -----------------
  // Kullanıcı sadece sayı yazdı mı?
  // -----------------
  if (/^\d+$/.test(content)) {
    if (!config.listChannelId || !config.listMessageId) return;

    const num = parseInt(content);
    const listChannel = await client.channels.fetch(config.listChannelId).catch(() => null);
    if (!listChannel) return;

    const listMessage = await listChannel.messages.fetch(config.listMessageId).catch(() => null);
    if (!listMessage) return;

    let lines = listMessage.content.split("\n");
    const lineIndex = lines.findIndex(l => l.trim().startsWith(`${num})`));

    if (lineIndex === -1) return;

    // Eski mention'u temizle
    lines[lineIndex] = lines[lineIndex].replace(/–\s*<@!?\d+>/, "");

    // Yeni mention'u ekle
    lines[lineIndex] = `${lines[lineIndex]} – <@${msg.author.id}>`;

    await listMessage.edit(lines.join("\n"));
  }
});

client.login("MTQzOTAyMzU5NDQ1NzAxMDM0OA.GS-NiJ.oZahY43tq4golV2cOdwJWdweQrchtsVltagUpc");
