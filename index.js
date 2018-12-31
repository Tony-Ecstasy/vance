const botconfig = require("./botconfig.json");
const tokenfile = require("./token.json");
const Discord = require("discord.js");
const fs = require("fs");   
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();
let purple = botconfig.purple;
let xp = require('./xp.json')
let cooldown = new Set();
let cdseconds = 3;

fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);
  let jsfile =  files.filter(f => f.split(".").pop() === "js")
  if(jsfile.length <= 0){
    console.log("Couldn't find commands!");
    return;
  }

  jsfile.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded!`)
    bot.commands.set(props.help.name, props);
  });
});

bot.on("ready", async () => {
    console.log(`${bot.user.username} is online!`);
    bot.user.setGame("CattorBot | !help");
});

bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));

  if(!prefixes[message.guild.id]){
    prefixes[message.guild.id] = {
      prefixes: botconfig.prefix
    };
  }

  let prefix = prefixes[message.guild.id].prefixes;
  console.log(prefix);



  let xpAdd = Math.floor(Math.random() * 7) + 8;
  console.log(xpAdd)

  if(!xp[message.author.id]){
    xp[message.author.id] = {
      xp: 0,
      level: 0
    };
  }

  let curxp = xp[message.author.id].xp
  let curlvl = xp[message.author.id].level;
  let nxtLvl = xp[message.author.id].level * 220;
  xp[message.author.id].xp = curxp + xpAdd;
  if(nxtLvl <= xp[message.author.id].xp){
    xp[message.author.id].level = curlvl + 1;
    let lvlup = new Discord.RichEmbed()
      .addField(`Эй ${message.user.username}, ты достиг ${curlvl + 1}`)
      .setColor("#e88b00")
    message.channel.send(lvlup)
  }
    fs.writeFile("./xp.json", JSON.stringify(xp), (err) => {
    if(err) console.log(err);
  });

  //let prefix = "!"
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  if(message.content.startsWith(prefix)){
  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args)
  }else{ }

});

bot.on('messageUpdate', async (oldmsg, newmsg) => {
  let dEmbed = new Discord.RichEmbed()
    .setAuthor('Сообщение изменено')
    .addField('Отправитель', oldmsg.member, true)
    .addField('Канал', oldmsg.channel, true)
    .addField('Раньше', oldmsg.content)
    .addField('Сейчас', newmsg.content)
    .setColor("#ff290c")
    .setTimestamp()
    .setFooter("Изменено");

  let dChannel = oldmsg.guild.channels.find(`name`, "log")
  
  dChannel.send(dEmbed);
});

bot.on('messageDelete', async message => {
  let dEmbed = new Discord.RichEmbed()
    .setAuthor('Сообщение удалено')
    .addField('Отправитель', message.member, true)
    .addField('Канал', message.channel, true)
    .addField('Содержание', message.content)
    .setColor("#ea0202")
    .setTimestamp()
    .setFooter("Удалено");

  let dChannel = message.guild.channels.find(`name`, "log")
  
  dChannel.send(dEmbed);
});

bot.on('guildMemberAdd', async member => {

  let embed = new Discord.RichEmbed()
  let channel = member.guild.channels.find(c => c.name == 'welcome')
    .setAuthor('Участник присоединился')
    .serDescription(`${member.user.username}#${member.user.discriminator} (${member})`)
    .setColor("#fc6400")
    .setTimestamp()
    .setFooter("Присоединился")
  await channel.send(embed)
});

bot.on('guildMemberRemove', async member => {
  let embed = new Discord.RichEmbed()
    .setAuthor('Участик вышел', member.user.avatarURL)
    .setDescription(`${member.user.username}#${member.user.discriminator} (${member})`)
    .setColor("#ea0202")
    .setTimestamp()
    .setFooter("Вышел")
  let channel = member.guild.channels.find(c => c.name == 'log')
  await channel.send(embed)
});

bot.login(tokenfile.token);
