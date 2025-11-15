require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Events } = require("discord.js");

let listChannelId = process.env.LIST_CHANNEL_ID || null;
let listMessageId = process.env.LIST_MESSAGE_ID || null;

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

    listChannelId = msg.channel.id;
    listMessageId = msg.reference.messageId;

    // 🔥 Railway’e env olarak kaydet
    console.log("Yeni liste kaydedildi:", listChannelId, listMessageId);

    return msg.reply("✅ Liste mesajı kaydedildi!");
  }

  // -----------------
  // Kullanıcı sadece sayı yazdı mı?
  // -----------------
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

    // Eski mention'u temizle
    lines[lineIndex] = lines[lineIndex].replace(/–\s*<@!?\d+>/, "");

    // Yeni mention'u ekle
    lines[lineIndex] = `${lines[lineIndex]} – <@${msg.author.id}>`;

    await listMessage.edit(lines.join("\n"));
  }
});

client.login(process.env.TOKEN);
