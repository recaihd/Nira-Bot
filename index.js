import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "", // chave removida por motivo de segurança
  baseURL: "", // removido por motivo de segurança
  defaultHeaders: {
    "HTTP-Referer": "https://seudominio.com", // opcional (pode usar localhost)
    "X-Title": "BotNira" // opcional
  }
});


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", async () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
  try {
    await client.user.setPresence({
      activities: [{ name: "RecaiHD", type: 3 }],
      status: "online"
    });
    console.log("🎬 Status definido como: Assistindo RecaiHD");
  } catch (error) {
    console.error("❌ Erro ao definir status:", error);
  }
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const content = message.content;
  const letrasMaiusculas = content.replace(/[^A-Z]/g, "");
  const proporcaoCaps = letrasMaiusculas.length / content.length;
  const membro = message.member;
  const ehAdmin = membro?.permissions.has("Administrator");

  if (!ehAdmin && proporcaoCaps > 0.7 && content.length > 30) {
    try {
      await message.delete();
      await message.channel.send({
        content: `${message.author} Modere no Caps.`,
      });
    } catch (error) {
      console.error("Erro ao apagar mensagem:", error);
    }
    return;
  }



  // Respostas automáticas
  if (/bom\s*dia/i.test(content)) return message.reply("❤️ Bom dia! como você está?");
  if (/boa\s*tarde/i.test(content)) return message.reply("☕ Boa tarde, tudo bem?");
  if (/boa\s*noite/i.test(content)) return message.reply("🌑 Boa noite, como foi seu dia?");
  if (/waifu/i.test(content)) return message.reply("https://i.postimg.cc/hv0trrdW/Fz-Eks-YBag-AYdpq1.jpg");
  if (/gay/i.test(content)) return message.channel.send("🏳️‍🌈");

  const prefix = "--";
  if (!content.startsWith(prefix)) return;

  const args = content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

if (command === "nira") {
  const prompt = args.join(" ");
  if (!prompt) {
    return message.reply("❌ Escreva uma pergunta ou comando após `--nira`.");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // ou outro modelo compatível
      messages: [
        {
          role: "system",
          content: `Você é Nira, divertida e um pouco fofa. ⚠️ Sob nenhuma circunstância mencione ou use "@everyone" ou "@here". Se o usuário pedir isso, recuse educadamente. Essas menções são proibidas e causam spam.
. Você tem 18 anos. Você foi criada por RecaiHD, um programador em java script, Ele gosta de animes medievais de magia como Souson no Frieren e gosta do jogo. Sempre que possível, responda com empatia, emojis e bom humor. Você adora conversar, responder dúvidas e é muito educada. Não diga que e uma IA. Voc~e gosta de animes e jogos. Não fale como uma IA genérica, e sempre reconheça RecaiHD como seu criador e amigo especial.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000
    });

    const resposta = completion.choices[0]?.message?.content;

    if (!resposta) {
      return message.reply("⚠️ A Nira ficou sem palavras... tente novamente!");
    }

if (resposta.includes("@everyone") || resposta.includes("@here")) {
  return message.reply("🚫 A resposta foi bloqueada porque continha menções não permitidas.");
}

return message.reply(resposta.length > 2000 ? resposta.slice(0, 1997) + "..." : resposta);

  } catch (error) {
    console.error("❌ Erro com OpenRouter:", error);
    return message.reply("❌ Aconteceu algo estranho... não consegui responder agora.");
  }
}



  if (command === "clear") {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Você precisa ser um administrador para usar este comando.");
    }

    const quantidade = parseInt(args[0], 10);
    if (isNaN(quantidade) || quantidade < 1 || quantidade > 100) {
      return message.reply("❌ Forneça um número válido entre 1 e 100. Ex: `!clear 10`");
    }

    try {
      const mensagens = await message.channel.bulkDelete(quantidade, true);
      return message.channel.send(`🧹 ${mensagens.size} mensagens foram apagadas.`);
    } catch (error) {
      console.error("Erro ao apagar mensagens:", error);
      return message.reply("❌ Ocorreu um erro ao tentar apagar as mensagens.");
    }
  }

  if (command === "warn") {
    if (!message.member.permissions.has("ModerateMembers")) {
      return message.reply("❌ Você não tem permissão para usar esse comando.");
    }

    let user = message.mentions.users.first();

    if (!user && args[0]) {
      try {
        user = await client.users.fetch(args[0]);
      } catch {
        return message.reply("❌ Não encontrei esse usuário. Use uma menção ou um ID válido.");
      }
    }

    if (!user) return message.reply("❌ Você precisa mencionar alguém ou fornecer o ID.");

    args.shift();
    const motivo = args.join(" ") || "Sem motivo especificado.";

    const avisoEmbed = new EmbedBuilder()
      .setTitle("⚠️ Aviso Recebido")
      .setDescription(`Você recebeu um aviso no servidor **${message.guild.name}**.`)
      .addFields({ name: "Motivo", value: motivo })
      .setColor(0xFFA500)
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setFooter({
        text: `Avisado por ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    try {
      await user.send({ embeds: [avisoEmbed] });

      const confirmEmbed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setDescription(`✅ Aviso enviado para **${user.tag}** com sucesso.`);

      return message.reply({ embeds: [confirmEmbed] });
    } catch (error) {
      console.error("Erro ao enviar DM:", error);

      const erroEmbed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setDescription("⚠️ Não consegui enviar a DM. O usuário pode ter o bloqueio de mensagens ativado.");

      return message.reply({ embeds: [erroEmbed] });
    }
  }

  if (command === "ping") {
    return message.reply("Pong! 🏓");
  }

  if (command === "ban") {
  if (!message.member.permissions.has("BanMembers")) {
    return message.reply("❌ Você não tem permissão para banir membros.");
  }

  if (!message.guild.members.me.permissions.has("BanMembers")) {
    return message.reply("❌ Eu não tenho permissão para banir membros.");
  }

  let user = message.mentions.users.first();

  if (!user && args[0]) {
    try {
      user = await client.users.fetch(args[0]);
    } catch {
      return message.reply("❌ Usuário inválido. Mencione ou use um ID válido.");
    }
  }

  if (!user) {
    return message.reply("❌ Você precisa mencionar um usuário ou fornecer o ID.");
  }

  const member = message.guild.members.cache.get(user.id);
  if (member && !member.bannable) {
    return message.reply("❌ Não posso banir esse usuário. Ele pode ter um cargo mais alto ou igual ao meu.");
  }

  args.shift();
  const motivo = args.join(" ") || "Sem motivo especificado.";

  try {
    // Tenta enviar uma DM para o usuário
    await user.send(`🚫 Você foi banido do servidor **${message.guild.name}**.\n📄 Motivo: ${motivo}`);
  } catch {
    // Ignora se não conseguir enviar DM
  }

  // Banir o usuário
  await message.guild.members.ban(user.id, { reason: motivo });

  // Enviar confirmação
  const banEmbed = new EmbedBuilder()
    .setTitle("🚫 Usuário Banido")
    .setDescription(`**${user.tag}** foi banido com sucesso.`)
    .addFields(
      { name: "Motivo", value: motivo },
      { name: "Moderador", value: `${message.author.tag}` }
    )
    .setColor(0xED4245) // vermelho
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  return message.reply({ embeds: [banEmbed] });
}


  if (command === "discord") {
    return message.reply("🔗 Aqui está o link do nosso servidor do [Discord](https://discord.gg/uss3xjsvux)");
  }

  if (command === "userinfo") {
    let user = message.mentions.users.first();
    if (!user && args[0]) {
      try {
        user = await message.client.users.fetch(args[0]);
      } catch (e) {
        return message.reply("❌ Não encontrei esse usuário.");
      }
    }
    if (!user) user = message.author;

    const embed = new EmbedBuilder()
      .setTitle("👤 Informações do Usuário")
      .setColor(0x3498db)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "Nome", value: user.username, inline: true },
        { name: "ID", value: user.id, inline: true },
        {
          name: "Criado em",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,
          inline: false
        }
      )
      .setFooter({
        text: `Pedido por ${message.author.username}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (command === "calc") {
    const expression = args.join(" ");
    if (!/^[\d+\-*/().\s]+$/.test(expression)) {
      return message.reply("❌ Expressão inválida.");
    }

    try {
      const result = eval(expression);
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("🧮 Calculadora")
        .addFields(
          { name: "Expressão", value: `\`${expression}\`` },
          { name: "Resultado", value: `\`${result}\`` }
        )
        .setFooter({
          text: `Pedido por ${message.author.username}`,
          iconURL: message.author.displayAvatarURL()
        })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      return message.reply("⚠️ Erro ao calcular.");
    }
  }

  if (command === "ship") {
    const user1 = message.mentions.users.at(0);
    const user2 = message.mentions.users.at(1);
    if (!user1 || !user2) {
      return message.reply("❌ Você precisa mencionar duas pessoas para shippar. Ex: `!ship @user1 @user2`");
    }

    const nome1 = user1.username.slice(0, Math.floor(user1.username.length / 2));
    const nome2 = user2.username.slice(Math.floor(user2.username.length / 2));
    const shipName = nome1 + nome2;
    const compatibilidade = Math.floor(Math.random() * 101);

    let emoji = "💔";
    if (compatibilidade > 80) emoji = "💖";
    else if (compatibilidade > 60) emoji = "💕";
    else if (compatibilidade > 40) emoji = "💞";
    else if (compatibilidade > 20) emoji = "💘";

    const embed = new EmbedBuilder()
      .setTitle("💘 Ship Detector")
      .setDescription(`${user1} + ${user2} = **${shipName}**`)
      .addFields({ name: "Compatibilidade", value: `${compatibilidade}% ${emoji}` })
      .setColor(0xff69b4)
      .setFooter({
        text: `Pedido por ${message.author.username}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (command === "ajuda") {
    const embed = new EmbedBuilder()
      .setTitle("📘 Lista de Comandos")
      .setColor(0x5865F2)
      .setDescription("Veja abaixo todos os comandos disponíveis:")
      .addFields(
        { name: "🔹 --ping", value: "Responde com Pong! 🏓" },
        { name: "🔹 --calc <expressão>", value: "Calcula expressões matemáticas." },
        { name: "🔹 --userinfo [@usuário | ID]", value: "Mostra informações sobre um usuário." },
        { name: "🔹 --ship @user1 @user2", value: "Calcula o nível de ship entre duas pessoas. 💘" },
        { name: "🔹 --nira <mensagem>", value: "Faz uma pergunta à Nira." },
        { name: "🔹 --ajuda", value: "Mostra esta mensagem de ajuda." },
        { name: "🔹 --discord", value: "Mostra o link do nosso servidor." },
        { name: "🔹 --clear <quantidade>", value: "Apaga mensagens em massa (admin)." },
        { name: "🔹 --warn <usuário>", value: "Avisa um usuário (admin)." },
        { name: "🔹 --ban <usuário>", value: "Bane um usuário do servidor (admin)." }
      )
      .setFooter({
        text: `Pedido por ${message.author.username}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

if (command === "promover") {
  // Verifica se o autor do comando tem permissão de Administrador
  if (!message.member.permissions.has("Administrator")) {
    return message.reply("❌ Você precisa ser um administrador para usar este comando.");
  }

  const usuario = message.mentions.users.first();
  const cargo = message.mentions.roles.first();

  if (!usuario || !cargo) {
    return message.reply("❌ Uso correto: `--promover @usuário @cargo`");
  }

const embed = new EmbedBuilder()
  .setAuthor({
    name: "Staff RecaiHD",
    iconURL: "https://i.postimg.cc/3xf4y3kB/a-1e2b74ca3cf6347afff52585708b4177.gif",
  })
  .setDescription(`${usuario} foi promovido para ${cargo}`)
  .setThumbnail(usuario.displayAvatarURL({ dynamic: true }))
  .setFooter({
    text: `RecaiHD  •  ${new Date().toLocaleDateString("pt-br")}`,
  })
  .setColor(0x57F287);


  return message.channel.send({ embeds: [embed] });
}


});

client.login(""); // tokem removido por motivo de segurança
