require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Events } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel]
});

// ENV’de saklıyoruz
let listChannelId = process.env.LIST_CHANNEL_ID || null;
let listMessageId = process.env.LIST_MESSAGE_ID || null;

client.once(Events.ClientReady, () => {
  console.log(`Bot giriş yaptı: ${client.user.tag}`);
});

// LISTE AYARLAMA
client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;

  const content = msg.content.trim();

  if (content === "!liste-ayarla") {
    if (!msg.reference?.messageId) {
      return msg.reply("Bu komutu **liste mesajına cevap atarak** kullanmalısın.");
    }

    listChannelId = msg.channel.id;
    listMessageId = msg.reference.messageId;

    console.log("Liste kaydedildi:", listChannelId, listMessageId);

    return msg.reply("✅ Liste mesajı kaydedildi!");
  }

  // SAYI YAZANLARI OKUMA
  if (/^\d+$/.test(content)) {
    if (!listChannelId || !listMessageId) return;

    const num = parseInt(content);

    const listChannel = await client.channels.fetch(listChannelId).catch(() => null);
    if (!listChannel) return;

    const listMessage = await listChannel.messages.fetch(listMessageId).catch(() => null);
    if (!listMessage) return;

    let lines = listMessage.content.split("\n");

    const lineIndex = lines.findIndex(l => l.trim().startsWith(`${num})`));
    if (lineIndex === -1) return;

    // Eski mention temizle
    lines[lineIndex] = lines[lineIndex].replace(/–\s*<@!?\d+>/, "");

    // Yeni mention ekle
    lines[lineIndex] = `${lines[lineIndex]} – <@${msg.author.id}>`;

    await listMessage.edit(lines.join("\n"));
  }
});

// Bot login
client.login(process.env.TOKEN);
