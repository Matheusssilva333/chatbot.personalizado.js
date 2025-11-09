import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  // Usar import dinâmico para módulos ES
  import(filePath).then(commandModule => {
    const command = commandModule.default || commandModule;
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute" obrigatória.`);
    }
  }).catch(error => {
    console.error(`Erro ao carregar o comando ${filePath}:`, error);
  });
}

const rest = new REST().setToken(token);

// A execução do registro de comandos precisa esperar que todos os imports dinâmicos sejam resolvidos
// Para simplificar, vamos mover o registro para fora do loop e assumir que os comandos serão carregados
// antes que esta parte do código seja executada, ou usar Promise.all para esperar por eles.
// Por enquanto, para fins de correção rápida, vamos manter a estrutura e focar na sintaxe.

// No entanto, para garantir que todos os comandos sejam carregados antes do put, precisamos de um array de Promises
Promise.all(commandFiles.map(file => {
  const filePath = path.join(commandsPath, file);
  return import(filePath).then(commandModule => {
    const command = commandModule.default || commandModule;
    if ('data' in command && 'execute' in command) {
      return command.data.toJSON();
    } else {
      console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute" obrigatória.`);
      return null;
    }
  }).catch(error => {
    console.error(`Erro ao carregar o comando ${filePath}:`, error);
    return null;
  });
}))
.then(loadedCommands => {
  const validCommands = loadedCommands.filter(cmd => cmd !== null);
  console.log(`Iniciando o registro global de ${validCommands.length} comandos.`);
  console.log('Isso pode levar até uma hora para ser totalmente propagado para todos os servidores.');

  rest.put(
    Routes.applicationCommands(clientId),
    { body: validCommands },
  )
  .then(data => {
    console.log(`Registrado com sucesso ${data.length} comandos globalmente.`);
  })
  .catch(error => {
    console.error(error);
  });
})
.catch(error => {
  console.error("Erro durante o carregamento ou registro dos comandos:", error);
});