const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

// Load environment variables
const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  console.error("❌ Missing BOT_TOKEN or CLIENT_ID in Railway variables.");
  process.exit(1);
}

// Truth or Dare lists
const truths = [
  "What is your biggest fear?",
  "What is a secret you’ve never told anyone?",
  "Who was your first crush?",
  "What is something embarrassing you’ve done?"
];

const dares = [
  "Do 10 push-ups.",
  "Say the alphabet backwards.",
  "Send a funny emoji in the chat.",
  "Speak only in emojis for the next 2 minutes."
];

// Create client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('tod')
    .setDescription('Start a Truth or Dare game')
].map(cmd => cmd.toJSON());

// Register commands
(async () => {
  try {
    console.log("Registering commands...");
    const rest = new REST({ version: '10' }).setToken(token);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("Commands registered.");
  } catch (err) {
    console.error(err);
  }
})();

// Bot ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Handle interactions
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'tod') {

      const embed = new EmbedBuilder()
        .setTitle("🎲 Truth or Dare")
        .setDescription("Choose one of the buttons below to begin!")
        .setColor("Purple");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('truth')
          .setLabel('Truth')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('dare')
          .setLabel('Dare')
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({ embeds: [embed], components: [row] });
    }
  }

  // Button interactions
  if (interaction.isButton()) {
    if (interaction.customId === 'truth') {
      const randomTruth = truths[Math.floor(Math.random() * truths.length)];
      return interaction.reply(`🟦 **Truth:** ${randomTruth}`);
    }

    if (interaction.customId === 'dare') {
      const randomDare = dares[Math.floor(Math.random() * dares.length)];
      return interaction.reply(`🟥 **Dare:** ${randomDare}`);
    }
  }
});

// Login
client.login(token);
