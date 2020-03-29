// Invite
// https://discordapp.com/oauth2/authorize?client_id=692639102595498014&scope=bot&permissions=2112

const Discord = require('discord.js');
const client = new Discord.Client();
client.login (process.env.TOKEN);
const botid = "692639102595498014";

/*
const ouiicon = '👍';
const nonicon = '👎';
const absicon = '🤷‍♀️';
*/

const ouiicon = '\u2705'; // '✅';
const nonicon = '\u26D4'; // '⛔️';
const absicon = '\u23FA'; // '⏺';


client.on('message', async msg =>
{
  var prefix = ".vote" ;
  
  
  
  if (msg.author.bot) return; 
  
  if (msg.content.startsWith("voter ici") || msg.content.includes(botid)) 
  {
    await msg.reply("J'écoute sur .vote");
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
  while(args.length > 0)
  {
      word = args.shift();
      switch (word)
      {
         case "-q":  query = true; break;
         case "-a":  query = true; anonymous = true; break;
         case "-t":  if (args.length > 0) { duration = args.shift(); durationset = true; } break;
         default: qwords.push(word);
      }
  }
  question = qwords.join(" ");
  if (duration <= 0) duration = 20;
  
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
      if (reaction.emoji.name == nonicon) { non.push(userid); oui = oui.filter(s => s != userid); abstention = abstention.filter(s => s != userid); non = non.filter(s => s != userid);}
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
          lines.push(ouiicon + " " + oui.length        );
          lines.push(nonicon + " " + non.length        );
          lines.push(absicon + " " + abstention.length );
        }
        else
        {
          lines.push(ouiicon + " " + oui.length        + " " + oui.map(s => "<@"+s+">").join(" "));
          lines.push(nonicon + " " + non.length        + " " + non.map(s => "<@"+s+">").join(" "));
          lines.push(absicon + " " + abstention.length        + " " + abstention.map(s => "<@"+s+">").join(" "));
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
  else
  {
    msg.channel.send("Utilisation:\n\n.vote -q <question> // vote ouvert\n"+
                    ".vote -a <question> // vote anonyme\n"+
                    ".vote -t <secondes> -q <question> // durée en secondes (défaut 20)\n"+
                    ".vote -t <secondes> // temps de parole sans vote (pas de défaut)\n"+
                    ".vote // aide\n\n"+
                    "// Le vote dure 20 secondes.\n"+
                    "// Il faut cliquer oui "+ouiicon+", non "+nonicon+" ou abstention "+absicon+".\n\n"+
                    "// Limite: Pendant le vote, chaque option est +1.\n"+
                    "// Limite: Le vote anonyme ne l'est pas pendante le vote\n"+
                    "// Limite: Si vous appuyez plusieurs boutons, le dernier est déterminant.\n\n"+
                    "// v1.0.1 © 2020 matthias.buercher@verts.vd.ch"); 
  }
          
});


require('http').createServer(function(request,response)
{
  response.end("Hallo!");
  
}).listen(process.env.PORT);