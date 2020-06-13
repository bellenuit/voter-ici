// Invite
// https://discordapp.com/oauth2/authorize?client_id=CLIENT&scope=bot&permissions=2112

// Upload monitor

const Discord = require('discord.js');
const client = new Discord.Client();
client.login (process.env.TOKEN);
const botid = process.env.CLIENT;
const seed = 89018921891;

/*
const ouiicon = '👍';
const nonicon = '👎';
const absicon = '🤷‍♀️';
*/

const ouiicon = '\u2705'; // '✅';
const nonicon = '\u26D4'; // '⛔️';
const absicon = '\u23FA'; // '⏺';

function hash(uid)
{
  const g = Math.floor(new Date().getTime()/3600.0/1000.0);
  return "x"+murmurhash2_32_gc(uid+g,seed).toString(16).substring(1, 4);
}


client.on('message', async msg =>
{
  var prefix = process.env.PREFIX ;
  
  
  
  if (msg.author.bot) return; 
  
  if (msg.content.startsWith("voter ici") || msg.content.includes(botid)) 
  {
    await msg.reply("J'écoute sur "+process.env.PREFIX);
    return;
  }
   
  if(!msg.content.startsWith(prefix)) return;
  
  const args = msg.content.split(" ");
  const prog  = args.shift();
  
  let word = "";
  let query = false;
  let anonymous = false;
  let duration = 0;
  let qwords = [];
  let question = "";
  let durationset = false;
  let hashset = false;
  while(args.length > 0)
  {
      word = args.shift();
      switch (word)
      {
        case "-q":  query = true; break;
        case "-a":  query = true; anonymous = true; break;
        case "-t":  if (args.length > 0) { duration = args.shift(); durationset = true; } break;
        case "-x":  hashset = true; break;
        default: qwords.push(word);
      }
  }
  question = qwords.join(" ");
  if (duration <= 0) duration = 30;
  
  var result = "";
  var oui = [];
  var non = [];
  var abstention = [];
  
  if (query)
  {
    
    // Voting timer as loop of timeouts, until duration is consumed
    
    function timeout() 
    {
        setTimeout(function () 
        {
            counter -= 2000;
            if (counter > 0)
            {
              m2.edit("🗳 "+question+"\nVous avez " + counter/1000 + " secondes pour voter...\n");
              timeout();
            }
            else { m2.edit("🗳 "+question+"\nLe vote est clos.\n");}
            
        }, 2000);
    }
    
    let counter = duration * 1000;
    let m2;
    m2 = await msg.channel.send("🗳 "+question+"\nVous avez " + duration + " secondes pour voter...\n"); 
    timeout();
    
    // add first reactions
    
    m2.react(ouiicon).then(r => { m2.react(nonicon);  }).then(r => { m2.react(absicon); });

    // create a collector for duration + 1 second and collect reactions with events collect, remove, end
    
    const filter = (reaction, user) => 
    {
	      return [ouiicon, nonicon, absicon].includes(reaction.emoji.name);
    };
    
    const collector = m2.createReactionCollector(filter, { time: duration * 1000 + 1000 });

    collector.on('collect', (reaction, userid) => {
      
      if (userid == botid ) return;
      
      
      // remove all other choices each time
      
      if (reaction.emoji.name == ouiicon) { oui.push(userid); non = non.filter(s => s != userid); abstention = abstention.filter(s => s != userid);}
      if (reaction.emoji.name == nonicon) { non.push(userid); oui = oui.filter(s => s != userid); abstention = abstention.filter(s => s != userid);}
      if (reaction.emoji.name == absicon) { abstention.push(userid); oui = oui.filter(s => s != userid); non = non.filter(s => s != userid);}
	     
      
    });
    
    // remove must be further tested
    
    collector.on('remove', (reaction, userid) => {
      
      
      if (userid == botid ) return;  
      
      if (reaction.emoji.name == ouiicon) { oui = oui.filter(s => s != userid); }
      if (reaction.emoji.name == nonicon) { non = non.filter(s => s != userid);  }
      if (reaction.emoji.name == absicon) { abstention = abstention.filter(s => s != userid); }
      
    });

    collector.on('end', collected => {
        var lines = [];
      
        const distinct = (value, index, self) => { return self.indexOf(value) === index ; } 
      
        oui = oui.filter(distinct);  
        non = non.filter(distinct); 
        abstention = abstention.filter(distinct); 
      
        lines.push("📊 " + question);
        if (anonymous)
        {
          lines.push(ouiicon + " " + oui.length        + ": " + oui.map(s => hash(s)).join(" "));
          lines.push(nonicon + " " + non.length        + ": " + non.map(s => hash(s)).join(" "));
          lines.push(absicon + " " + abstention.length + ": " + abstention.map(s => hash(s)).join(" "));
        }
        else
        {
          lines.push(ouiicon + " " + oui.length        + ": " + oui.map(s => "<@"+s+">").join(" "));
          lines.push(nonicon + " " + non.length        + ": " + non.map(s => "<@"+s+">").join(" "));
          lines.push(absicon + " " + abstention.length        + ": " + abstention.map(s => "<@"+s+">").join(" "));
        }
      
        m2.channel.send(lines.join("\n"));
      
        m2.delete();
    });
    
  }
  else if (durationset)
  {
    // speaker timer feature same loop
    
    function timeout() 
    {
        setTimeout(function () 
        {
            counter -= 2000; 
            if (counter > 0) 
            {
              m2.edit("📢 Temps de parole " + counter/1000 + " secondes\n");
              timeout(); 
            }
            else 
            { m2.edit("📢 Le temps de parole est fini.\n");}
            
        }, 2000);
    }
    
    let counter = duration * 1000;
    let m2;
    m2 = await msg.channel.send("📢 Temps de parole " + counter/1000 + " secondes\n"); 
    timeout();
  }
  else if (hashset)
  {
    if (msg.channel.type == "dm")
    { msg.reply("Votre hash actuel est "+hash(msg.author)); }
    else
    { msg.reply("Je ne réponds pas ce genre de questions en public (faites un DM)."); }  
  }
  else
  {
    msg.channel.send("Utilisation:\n\n"+process.env.PREFIX+" -q <question> // vote ouvert\n"+
                    process.env.PREFIX+" -a <question> // vote pseudo avec hash\n"+
                    process.env.PREFIX+" -t <secondes> -q <question> // durée en secondes (défaut 20)\n"+
                    process.env.PREFIX+" -t <secondes> // temps de parole sans vote (pas de défaut)\n"+
                    process.env.PREFIX+" -x // demander le hash (en DM seulement)\n"+
                    process.env.PREFIX+" // aide\n\n"+
                    "// Le vote dure 30 secondes.\n"+
                    "// Il faut cliquer oui "+ouiicon+", non "+nonicon+" ou abstention "+absicon+".\n\n"+
                    "// Limite: Pendant le vote, chaque option est +1.\n"+
                    "// Limite: Le vote pseudo n'est pas vraiment anonyme (tooltip sur reaction pendant le vote)\n"+
                    "// Note: Si vous votez plusieurs fois, le dernier vote est déterminant.\n"+
                    "// Note: Le hash des membres change chaque heure.\n\n"+
                    "// v1.0.4 © 2020 matthias.buercher@verts.vd.ch "+process.env.SERVER); 
  }
          
});


require('http').createServer(function(request,response)
{
  response.end("Bonjour! Je suis chez " + process.env.SERVER);
  
}).listen(process.env.PORT);


function murmurhash2_32_gc(str, seed) {
  var
    l = str.length,
    h = seed ^ l,
    i = 0,
    k;
  
  while (l >= 4) {
  	k = 
  	  ((str.charCodeAt(i) & 0xff)) |
  	  ((str.charCodeAt(++i) & 0xff) << 8) |
  	  ((str.charCodeAt(++i) & 0xff) << 16) |
  	  ((str.charCodeAt(++i) & 0xff) << 24);
    
    k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    k ^= k >>> 24;
    k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

	h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

    l -= 4;
    ++i;
  }
  
  switch (l) {
  case 3: h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
  case 2: h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
  case 1: h ^= (str.charCodeAt(i) & 0xff);
          h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
  }

  h ^= h >>> 13;
  h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
  h ^= h >>> 15;

  return h >>> 0;
}