const { REST, Routes } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute" obrigatória.`);
  }
}

const rest = new REST().setToken(token);

try {
  console.log(`Iniciando o registro global de ${commands.length} comandos.`);
  console.log('Isso pode levar até uma hora para ser totalmente propagado para todos os servidores.');

  rest.put(
    Routes.applicationCommands(clientId),
    { body: commands },
  )
  .then(data => {
    console.log(`Registrado com sucesso ${data.length} comandos globalmente.`);
  })
  .catch(error => {
    console.error(error);
  });
} catch (error) {
  console.error(error);
}