const Discord = require('discord.js');
const client = new Discord.Client();
client.login (process.env.TOKEN);




client.on('message', async msg =>
{
  var prefix = ".vote" ;
  const speed = 1;
  
  if (msg.author.bot) return; 
  
  if (msg.content.startsWith("voter ici") || msg.content.includes("692639102595498014")) 
  {
    await msg.reply("J'écoute sur .vote");
    return;
  }
   
  if(!msg.content.startsWith(prefix)) return;
  

  const args = msg.content.split(" ");
  
  const prog  = args.shift();
  
  var command = "";
  if (args.length > 0) { command = args.shift().toLowerCase(); }

  var question = "";
  if (args.length > 0) question  = args.join(" ");
  
  let anonymous = false;
  if (command === "-a") { anonymous = true; }
  
  if (command === "-q" || command === "-a")
  {
    let m2;
    let t = 5000/speed;
    m2 = await msg.channel.send("🗳 "+question+"\nVous avez 20 secondes pour voter..."); 
        
    setTimeout(() => { m2.edit("🗳 "+question+"\nVous avez 15 secondes pour voter...");
    setTimeout(() => { m2.edit("🗳 "+question+"\nVous avez 10 secondes pour voter...");
    setTimeout(() => { m2.edit("🗳 "+question+"\nVous avez 5 secondes pour voter...");
    setTimeout(() => { m2.edit("🗳 "+question+"\nLe vote est clos.");
                     }, t);
                     }, t);                 
                     }, t);
                     }, t);

    m2.react('👍').then(r => { m2.react('👎');  }).then(r => { m2.react('🤷‍♀️'); });

    const filter = (reaction, user) => 
    {
	      return ['👍', '👎','🤷‍♀️'].includes(reaction.emoji.name) && user.id === m2.author.id;
    };

    m2.awaitReactions(filter, { max: 999, time: 21000/speed, errors: ['time'] })
	  .then(collected => 
    {       
        msg.channel.send("Tout le monde a voté.") 
	  })
    .catch(collected => 
    {
          msg.channel.send("📊 "+question);
          collected.each(reaction => {
          
              if (anonymous || reaction.count == 1)
              {
                msg.channel.send(reaction.emoji.name + " " + (reaction.count - 1) );
              }
              else
              {
                // hack to get user names
                const ca = reaction.users.cache;
                const s = JSON.stringify(ca);
                const ob = JSON.parse(s);
                const unused  = ob.shift();
                const s2 = JSON.stringify(ob);
                let users = [];
                s2.match(/"username":"(.*?)"/g).forEach ((element) =>
                {
                   users.push(element.slice(12,-1));
                });
                users.sort();
                msg.channel.send(reaction.emoji.name + " " + (reaction.count - 1) + " " + users.join(", "));
              }
                                   
          });
      
          m2.delete();
      
    });
    
  }
  else
  {
    msg.channel.send("Utilisation:\n\n.vote -q Question? // vote ouvert\n"+
                    ".vote -a Question? // vote anonyme\n"+
                    ".vote // aide\n\n"+
                    "// Le vote dure 20 secondes.\n"+
                    "// Il faut cliquer oui '👍', non '👎' ou abstention '🤷‍♀️'.\n\n"+
                    "// Limite: Pendant le vote, chaque option est +1.\n"+
                    "// Limite: Le vote anonyme ne l'est pas pendante le vote\n"+
                    "// Limite: .vote n'empêche pas le vote multiple.\n\n"+
                    "// v1.0.0 © 2020 matthias.buercher@verts.vd.ch"); 
  }
          
});


require('http').createServer(function(request,response)
{
  response.end("Hallo!");
  
}).listen(process.env.PORT);