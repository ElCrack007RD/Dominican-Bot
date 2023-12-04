const { Client, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js")
const client = new Client({ intents: [3276799] })
const config = require("./config.json");

// -----------------------------------------------Policia-------------------------------------------------
const entries = new Map();
var salidabtn;
let EntradaMsg

client.on('messageCreate', message => {
    try {
        if (message.content === '!entrada') {
            const userId = message.author.id;

            entries.set(userId, new Date());

            // Temporizador para verificar si han pasado 8 horas
            const eightHours = 8 * 60 * 60 * 1000; // 8 horas en milisegundos

            setTimeout(() => {
                if (entries.has(userId)) {
                    // Usuario ha trabajado más de 8 horas
                    const entryMessage = message.channel.messages.cache.get(entries.get(userId).entryMessageId);
                    if (entryMessage) {
                        entryMessage.delete(); // Borrar el mensaje de entrada
                    }
                    message.channel.send({
                        content: `<@${userId}> ¡Has trabajado duro durante más de 8 horas! Tu ponche se ha registrado, pero el mensaje de entrada ha sido eliminado.`,
                        ephemeral: true
                    });
                }
                entries.delete(userId); // Limpiar la entrada
            }, eightHours);

            const salidabtn = new ActionRowBuilder()
                .addComponents([
                    new ButtonBuilder()
                        .setLabel("Salida")
                        .setEmoji("🚪")
                        .setStyle("Danger")
                        .setCustomId("salidabtn")
                ]);

            message.reply({
                content: 'Su ponche fue abierto',
                components: [salidabtn]
            }).then(reply => {
                entries.get(userId).entryMessageId = reply.id; // Guardar el ID del mensaje de entrada
            });
        }
    } catch (error) {
        console.error(error);
        interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
    }
});

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.customId !== "salidabtn") {
            return;
        }

        const entry = entries.get(interaction.user.id);

        if (entry) {
            EntradaMsg = interaction.message
            const exit = new Date();
            const duration = exit.getTime() - entry.getTime();
            const minutes = Math.floor(duration / 60000);
            const seconds = ((duration % 60000) / 1000).toFixed(0);

            const guild = interaction.guild;

            let imageUrl;
            if (guild) {
                if (guild.id === '827336009494036500') {
                    imageUrl = "https://media.discordapp.net/attachments/1149348263095447604/1151131402381819994/DYPD.png?width=663&height=663";
                } else if (guild.id === '1149898391254487171') {
                    imageUrl = "https://media.discordapp.net/attachments/974086134923677697/1150915659631435856/Video.gif?width=663&height=663";
                }
                else {
                    imageUrl = "https://media.discordapp.net/attachments/978445162776760350/984932116234129428/dominican_york_banner_animad1o22.gif?width=576&height=576";
                }
            }

            // Crear el embed
            const embed = new EmbedBuilder()
                .setColor("DarkAqua")
                .setTitle(`Ponche de: ${interaction.member.nickname}`)
                .setDescription(`Esta persona trabajo durante ${minutes} minutos con ${seconds} segundos`)
                .setFooter({
                    text: "Powered by Dominican York"
                })
                .setImage(imageUrl)

            const content = await interaction.channel.send({ embeds: [embed] });
            if (minutes >= 700) {
                await content.react("❌");
            } else {
                await content.react("<a:check:1149715397545836584>");
            }

            entries.delete(interaction.user.id);
            interaction.update({
                components: [interaction.message.components[0]]
            });

            setTimeout(() => {
                if (EntradaMsg && !EntradaMsg.deleted) {
                    EntradaMsg.delete().catch(error => {
                        console.error(`Error al borrar el mensaje de entrada: ${error}`);
                    });
                }
            }, 10000);
        } else {
            interaction.reply({ content: 'Debes hacer una entrada primero.', ephemeral: true });
        }
    } catch (error) {
        console.error(error);
        interaction.channel.send({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
    }
});


client.on('interactionCreate', async (evidence) => {
    if (!evidence.isCommand()) return;

    if (evidence.commandName == 'evidencia') {
        const userName = evidence.user.toString();
        const userName_id = evidence.user;

        const involucrado = evidence.options.getString('involucrado');
        const Incautado = evidence.options.getString('incautado');
        const Descripcion = evidence.options.getString('descripcion');
        const vestimenta = evidence.options.getString('vestimenta');
        const Serial = evidence.options.getString('serial');
        const Cargos = evidence.options.getString('cargos');
        const foto = evidence.options.getAttachment('foto');

        // Crear el mensaje de sanción con EmbedBuilder
        var result;
        if (foto === undefined || foto === null) {
            result = new EmbedBuilder()
                .setTitle('Evidencia')
                .setDescription(`Evidencia subida por: ${userName}`)
                .setFields([
                    { name: "Involucrado:", value: involucrado, inline: true },
                    { name: "Vestimenta:", value: vestimenta, inline: true },
                    { name: "Incautado:", value: Incautado, inline: false },
                    { name: "Cargos Imputados:", value: Cargos, inline: true },
                    { name: "Serial Arma", value: Serial },
                    { name: "Detalles:", value: Descripcion }
                ])
                .setColor('#FF0000')
                .setImage("https://media.discordapp.net/attachments/1105303044628955248/1110932337912446976/51A89E23-465F-4781-8432-27800C42D2CB.gif?width=402&height=402")
                .setFooter({
                    text: "Powered by DominicanYorkRP"
                });
        } else {
            result = new EmbedBuilder()
                .setTitle('Evidencia')
                .setDescription(`Evidencia subida por: ${userName}`)
                .setFields([
                    { name: "Involucrado:", value: involucrado, inline: true },
                    { name: "Vestimenta:", value: vestimenta, inline: true },
                    { name: "Incautado:", value: Incautado, inline: true },
                    { name: "Cargos Imputados:", value: Cargos, inline: true },
                    { name: "Serial Arma", value: Serial },
                    { name: "Detalles:", value: Descripcion }
                ])
                .setColor('#FF0000')
                .setImage(foto.url)
                .setFooter({
                    text: "Powered by DominicanYorkRP"
                });
        }

        await evidence.reply({ embeds: [result] });

        // Enviar la foto al canal con ID 1171796633009279036 en el servidor con ID 827336009494036500
        const serverId = '827336009494036500';
        const channelId = '1171796633009279036';

        const guild = client.guilds.cache.get(serverId);
        if (guild) {
            const channel = guild.channels.cache.get(channelId);
            if (channel) {
                try {
                    await channel.send({ files: [foto.url] });
                } catch (error) {
                    console.error('Error al enviar la foto al canal:', error);
                }
            }
        }
    }
});


//------------------------- Comandos registrados --------------

client.once('ready', () => {
    console.log('Comandos Listos!');
    client.application.commands.create({
        name: 'reclutar',
        description: 'reclutar miembros',
        options: [{
            name: 'org',
            description: 'Organizacion que recluta',
            type: 8, // Tipo: Rol
            required: true
        },
        {
            name: 'reclutado',
            description: 'Usuario a reclutar',
            type: 6, // Tipo: Usuario
            required: true
        }
        ]
    });
    client.application.commands.create({
        name: 'sancionar',
        description: 'Registra una sanción',
        options: [
            {
                name: 'usuario',
                description: 'Usuario a sancionar',
                type: 6, // Tipo: Usuario
                required: true
            },
            {
                name: 'sancion',
                description: 'Tipo de sanción',
                type: 3, // Tipo: Texto
                required: true
            },
            {
                name: 'razon',
                description: 'Razón de la sanción',
                type: 3, // Tipo: Texto
                required: true
            },
            {
                name: 'foto',
                description: 'Evidencia',
                type: 11, // Tipo: Texto
                required: false
            }
        ]
    });
    client.application.commands.create({
        name: 'lista',
        description: 'Mostrar lista de organizaciones',
    });
    client.application.commands.create({
        name: 'sancionarorg',
        description: 'Registra una sanción para la organizacion',
        options: [
            {
                name: 'organizacion',
                description: 'organizacion a sancionar',
                type: 8, // Tipo: Usuario
                required: true
            },
            {
                name: 'sancion',
                description: 'Tipo de sanción',
                type: 4, // Tipo: Entero
                choices: [
                    {
                        name: 'Primer Strike',
                        value: 1
                    },
                    {
                        name: 'Segundo Strike',
                        value: 2
                    },
                    {
                        name: 'Tercer Strike',
                        value: 3
                    },
                    {
                        name: 'Organizacion Cerrada',
                        value: 4
                    }
                ],
                required: true
            },
            {
                name: 'razon',
                description: 'Razón de la sanción',
                type: 3, // Tipo: Texto
                required: true
            },
            {
                name: 'autorizacion',
                description: 'Autorizado por',
                type: 6, //Tipo: Usuario
                required: true
            }
        ]
    });
    client.application.commands.create({
        name: 'org',
        description: 'Representar',
    });
    client.application.commands.create({
        name: 'evidencia',
        description: 'Registra una evidencia',
        options: [
            {
                name: 'involucrado',
                description: 'Nombre IC del involucrado',
                type: 3, // Tipo: Texto
                required: true
            },
            {
                name: 'vestimenta',
                description: 'Detalles de la vestimenta',
                type: 3, // Tipo: Texto
                required: true
            },
            {
                name: 'incautado',
                description: 'Lista de cosas incautadas',
                type: 3, // Tipo: Texto
                required: true
            },
            {
                name: 'cargos',
                description: 'Cargos Imputados',
                type: 3, // Tipo: Texto
                required: true
            },
            {
                name: 'serial',
                description: 'Serial arma',
                type: 3, // Tipo: Texto
                required: true
            },
            {
                name: 'descripcion',
                description: 'Detalles del suceso',
                type: 3, // Tipo: Texto
                required: true
            },
            {
                name: 'foto',
                description: 'Evidencia del incidente',
                type: 11, // Tipo: Texto
                required: true
            }
        ]
    });

    client.application.commands.create({
        name: 'up',
        description: 'Server Up',
    });
});

// ----------------------------------------administracion-----------------------------------------------

client.on('interactionCreate', async (response) => {
    if (!response.isCommand()) return;

    if (response.commandName == 'sancionar') {
        const userName = response.user.toString();
        const userName_id = response.user;
        const member = response.guild.members.cache.get(userName_id.id);
        const rolesToExclude = ['980947504348684378', '852340619207901204', '1030688174453825657'];

        const hasExcludedRole = member.roles.cache.some(role => rolesToExclude.includes(role.id));

        if (hasExcludedRole) {
            const usuario = response.options.getUser('usuario');
            const sancion = response.options.getString('sancion');
            const razon = response.options.getString('razon');
            const foto = response.options.getAttachment('foto');
            var result;
            // Crear el mensaje de sanción con EmbedBuilder
            if (foto === undefined || foto === null) {
                result = new EmbedBuilder()
                    .setTitle('Sanción entregada')
                    .setDescription(`Sancion dada por: ${userName}`)
                    .setFields([
                        { name: "Usuario:", value: usuario.toString() },
                        { name: "Sancion:", value: sancion },
                        { name: "Razon:", value: razon }
                    ])
                    .setColor('#FF0000')
                    .setImage("https://media.discordapp.net/attachments/1105303044628955248/1110932337912446976/51A89E23-465F-4781-8432-27800C42D2CB.gif?width=402&height=402")
                    .setFooter({
                        text: "Powered by DominicanYorkRP"
                    });
            } else {
                result = new EmbedBuilder()
                    .setTitle('Sanción entregada')
                    .setDescription(`Sancion dada por: ${userName}`)
                    .setFields([
                        { name: "Usuario:", value: usuario.toString() },
                        { name: "Sancion:", value: sancion },
                        { name: "Razon:", value: razon }
                    ])
                    .setColor('#FF0000')
                    .setImage(foto.url)
                    .setFooter({
                        text: "Powered by DominicanYorkRP"
                    });
            }

            await response.reply({ embeds: [result] });
        } else {
            response.reply({ content: 'No tienes acceso a usar este comando', ephemeral: true });
        }
    }

});

client.on('interactionCreate', async (responseorg) => {
    if (!responseorg.isCommand()) return;

    if (responseorg.commandName == 'sancionarorg') {
        var result
        const Organizacion = responseorg.options.getRole('organizacion');
        const Sancion_ID = responseorg.options.getInteger('sancion');
        const Razon = responseorg.options.getString('razon');
        const userName = responseorg.user.toString();
        const autorizado = responseorg.options.getUser('autorizacion');

        switch (Sancion_ID) {
            case 1:
                result = new EmbedBuilder()
                    .setTitle('Sanción Para Organizacion')
                    .setDescription(`Sancion dada por: ${userName}`)
                    .setFields([
                        { name: "Organizacion:", value: Organizacion.toString() },
                        { name: "Sancion:", value: "1er Strike", inline: true },
                        { name: "Autorizado por:", value: autorizado.toString(), inline: true },
                        { name: "Razon:", value: Razon }
                    ])
                    .setColor('#FF0000')
                    .setImage("https://media.tenor.com/qMrIl9PgymYAAAAC/strike-out.gif")
                    .setFooter({
                        text: "Powered by DominicanYorkRP"
                    });
                await responseorg.reply({ embeds: [result] });
                break;
            case 2:
                result = new EmbedBuilder()
                    .setTitle('Sanción Para Organizacion')
                    .setDescription(`Sancion dada por: ${userName}`)
                    .setFields([
                        { name: "Organizacion:", value: Organizacion.toString() },
                        { name: "Sancion:", value: "2do Strike", inline: true },
                        { name: "Autorizado por:", value: autorizado.toString(), inline: true },
                        { name: "Razon:", value: Razon }
                    ])
                    .setColor('#FF0000')
                    .setImage("https://media.tenor.com/JFCeaDoNCfcAAAAC/two-strikes-dont-mess-up.gif")
                    .setFooter({
                        text: "Powered by DominicanYorkRP"
                    });
                await responseorg.reply({ embeds: [result] });
                break;
            case 3:
                result = new EmbedBuilder()
                    .setTitle('Sanción Para Organizacion')
                    .setDescription(`Sancion dada por: ${userName}`)
                    .setFields([
                        { name: "Organizacion:", value: Organizacion.toString() },
                        { name: "Sancion:", value: "3er Strike", inline: true },
                        { name: "Autorizado por:", value: autorizado.toString(), inline: true },
                        { name: "Razon:", value: Razon }
                    ])
                    .setColor('#FF0000')
                    .setImage("https://media.tenor.com/axesSJJxPmsAAAAC/umpire-baseball.gif")
                    .setFooter({
                        text: "Powered by DominicanYorkRP"
                    });
                await responseorg.reply({ embeds: [result] });
                break;
            case 4:
                result = new EmbedBuilder()
                    .setTitle('Sanción Para Organizacion')
                    .setDescription(`Sancion dada por: ${userName}`)
                    .setFields([
                        { name: "Organizacion:", value: Organizacion.toString() },
                        { name: "Sancion:", value: "Organizacion Cerrada", inline: true },
                        { name: "Autorizado por:", value: autorizado.toString(), inline: true },
                        { name: "Razon:", value: Razon }
                    ])
                    .setColor('#FF0000')
                    .setImage("https://media.tenor.com/znjmPw_FF3sAAAAC/close.gif")
                    .setFooter({
                        text: "Powered by DominicanYorkRP"
                    });
                await responseorg.reply({ embeds: [result] });
                break;
        }
    }
});

const fotoOrg = {
        /* C Negro */ "980961373121044561": "https://media.discordapp.net/attachments/1125206418987962528/1140697971579691098/GMP_U2F2ZUdIMDE.gif?width=1080&height=607", //Jalisco
        /* C rojo */  "1117993325056757791": "https://media.discordapp.net/attachments/1125206418987962528/1145815111462821888/clz_2.gif?width=1080&height=607", //Zetas
        /* C verde */ "1115379308282773554": "https://media.discordapp.net/attachments/1115380086615584778/1145170082935341127/IMG_8626.gif?width=765&height=270", //Sinaloa
        /* C Morado */"1098762625992634498": "https://media.discordapp.net/attachments/1125206418987962528/1138539664077238292/gif.gif?width=765&height=270", //64th
        /* C Gris */  "1129213266598563990": "https://media.discordapp.net/attachments/1129213783458467951/1151640869116588052/El_texto_del_parrafo_2.gif?width=765&height=270", //Kali
        /* G naranja*/"1167259766876274689": "https://cdn.discordapp.com/attachments/1149348263095447604/1168346832397668392/Untitled-video-Made-with-Clipchamp.gif?ex=65516ec7&is=653ef9c7&hm=a6f6c95272b2378605c6ff8168abf3887ab62ddf1c72e4706ce34f25f7c3a492&", //BBK
        /* C blanca */"1138637156164845569": "https://media.discordapp.net/attachments/1138641411655348245/1176702965306904586/medelln.gif?ex=656fd509&is=655d6009&hm=bc4f4d21974f1c0864296bb9a035084d3a787ed49b099a1c03cd8376d6d59456&=&width=540&height=303", //Templarios
        /* G azul */  "1147010699860639895": "https://media.discordapp.net/attachments/1125206418987962528/1147274491576209531/1123.png?width=1217&height=663", //EVS
        /* G morada */"1147285029077135430": "https://media.tenor.com/yPvtWQa0RgcAAAAC/decepticons-logo.gif", //Decepticons
        /* G gris */  "1154546533899964466": "https://media.discordapp.net/attachments/1149348263095447604/1155121435539415130/57D3BC7C-D09E-4622-A5D1-D3289805BE8F.png?width=931&height=492", //Los Kami
        /* G rojo */  "1159215064079925270": "https://media.discordapp.net/attachments/1149348263095447604/1171792335605092373/Familia_Dinero.gif?ex=655df7a7&is=654b82a7&hm=9d7c99004cbfc27776f78e9e7a1ed4978b72dc2b81a5a21354b297509aea1b19&=&width=720&height=540", //Familia Dinero
        /* G verde */ "1164007980929396846": "https://media.discordapp.net/attachments/1164008331183136861/1164282977107312741/WallEBK_AdobeExpress.gif?ex=6542a605&is=65303105&hm=783b9f28cd8e7d1d9052d5b2456aa044a088e0234bf90ee1a9457e90055a6cca&=&width=720&height=405", //EBK
};

// ----------------------------------Reclutamiento---------------------------------------
client.on('interactionCreate', async (reclutar) => {
    if (!reclutar.isCommand()) return;

    if (reclutar.commandName == 'reclutar') {
        var result;
        const reclutador = reclutar.user.toString();
        const reclutador_id = reclutar.user;
        const member = reclutar.guild.members.cache.get(reclutador_id.id);
        const rolesToExclude = ['980961426892030052', '1098762313147883541',
            '1167259450751602718', '1115379504504913930', '1117993173483012196',
            '1129213031600115793', '1138636945656922212', '1147010546676269176',
            '1147284837670060093', '1154546362311004251', '1164007832518148157',
            '1159214905317142569'];

        const hasExcludedRole = member.roles.cache.some(role => rolesToExclude.includes(role.id));

        if (hasExcludedRole) {
            const reclutado = reclutar.options.getUser('reclutado');
            const reclutado_id = reclutar.guild.members.cache.get(reclutado.id);
            const org = reclutar.options.getRole('org');
            const orgId = org.id;
            const imageUrl = fotoOrg[orgId] || "https://media.tenor.com/nkGQuXoHpogAAAAC/auxilio-me.gif";
            result = new EmbedBuilder()
                .setTitle("Solicitud de reclutamiento")
                .setDescription(`${reclutador} Quiere reclutar a ${reclutado}`)
                .setFields([
                    { name: "Reclutador:", value: reclutador.toString() },
                    { name: "Reclutado:", value: reclutado.toString() },
                    { name: "Organizacion:", value: org.toString() }
                ])
                .setColor('#FF0000')
                .setImage(imageUrl)
                .setFooter({
                    text: "Powered by DominicanYorkRP"
                })

            await reclutar.reply({ embeds: [result] });
            try {
                await reclutado_id.roles.add(org);
            }
            catch (error) {
                console.error('Error al asignar el rol:', error);
            }
        } else {
            reclutar.reply({ content: 'No tienes acceso a usar este comando', ephemeral: true });
        }
    }
});
//----------------Chuleria-------------------------------

const fotos = [
    "https://media.discordapp.net/attachments/980920638887829534/1096957336884629545/GIF_DY_333.gif?width=402&height=402",
    "https://media.discordapp.net/attachments/978445162776760350/984932116234129428/dominican_york_banner_animad1o22.gif?width=576&height=576",
    "https://images-ext-1.discordapp.net/external/9P3_qzD29IkIs06GE7LnU5e6_r7jizqjFOfwMq3OvX0/https/media.tenor.com/05ZgGaxgfSoAAAAC/elcallejonrp.gif?width=560&height=312",
    "https://media.discordapp.net/attachments/980920638887829534/1082077602438725672/standard.gif?width=526&height=67",
    "https://media.discordapp.net/attachments/831695585244610560/1149346182833905834/Dominican_york_10.gif?width=562&height=112",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2pzMGFtcDlkbW9zdXJvNzNzZmNvZDh0dHB2aXZiZml1dGljcGkyeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Yuwh5ahJch9IN4BEqX/giphy.gif"
];

client.on('interactionCreate', async (serverup) => {
    if (!serverup.isCommand()) return;

    if (serverup.commandName == 'up') {

        const num = Math.floor(Math.random() * fotos.length);
        const result = new EmbedBuilder()
            .setTitle('<:870698955841863750:1149715392470724741> SERVER UP! <:870698955841863750:1149715392470724741>')
            .setFields(
                {
                    name: "<a:corazon_ezquizofrenico:1149803165743599778>ATENCION DOMINICAN YORK INFORMA  📢", value: "<a:100:1149716756538064926> ESTAMOS ARRIBA <a:100:1149716756538064926>"
                },
                {
                    name: "<a:alien:1149715395226390689> Vamos pa' dentro <a:alien:1149715395226390689>", value: " "
                })
            .setAuthor({
                name: "Dominican York Bot"
            })
            .setThumbnail("https://media.discordapp.net/attachments/978445162776760350/984932116234129428/dominican_york_banner_animad1o22.gif?width=576&height=576")
            .setImage(fotos[num])
            .setColor('#00ff40')
            .setFooter({
                text: "Powered by DominicanYorkRP"
            })
        const connect = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setLabel("ENTRAR")
                    .setEmoji("🟢")
                    .setStyle("Link")
                    .setURL("https://cfx.re/join/755ole")
            ])
        const content = await serverup.channel.send("<a:alien:1149715395226390689> El servidor esta arriba, vamo alla! <a:alien:1149715395226390689>||@everyone||");
        content.react("<:870698955841863750:1149715392470724741>")
        content.react("<a:alien:1149715395226390689>")
        content.react("<a:check:1149715397545836584>")
        content.react("<a:charmander:1149715396333674597>")
        content.react("<a:100:1149716756538064926>")
        content.react("<a:corazon_ezquizofrenico:1149803165743599778>")

        await serverup.reply({ embeds: [result], components: [connect] });
    }
});

client.on('interactionCreate', async (listorg) => {
    if (!listorg.isCommand()) return;

    if (listorg.commandName == 'lista') {
        const result = new EmbedBuilder()
            .setTitle('Organizaciones de DominicanYork')
            .setDescription(`Carteles`)
            .setFields(
                {
                    name: "Cartel de Jalisco", value: "Cartel", inline: true
                },
                {
                    name: "Cartel de Sinaloa", value: "Cartel", inline: true
                },
                {
                    name: "Cartel de Medellin", value: "Cartel", inline: true
                },
                {
                    name: "Cartel Big 64TH BDS", value: "Cartel", inline: true
                },
                {
                    name: "Cartel de los Zetas", value: "Cartel", inline: true
                },
                {
                    name: "Cartel de Cali ", value: "Cartel", inline: true
                },)
            .setColor('#000000')
        const result2 = new EmbedBuilder()
            .setTitle('Gangas')
            .setFields(
                {
                    name: "EVS", value: "Ganga", inline: true
                },
                {
                    name: "Decepticons", value: "Ganga", inline: true
                },
                {
                    name: "Los Kami", value: "Ganga", inline: true
                },
                {
                    name: "EBK", value: "Ganga", inline: true
                },
                {
                    name: "Bad Boyz Kings", value: "Ganga", inline: true
                },
                {
                    name: "Familia Dinero", value: "Ganga", inline: true
                })
            .setColor('#000000')
            .setFooter({
                text: "Powered by DominicanYorkRP"
            })
        await listorg.reply({ embeds: [result, result2] });
    }
});

client.on('interactionCreate', async (roler) => {
    if (!roler.isCommand()) return;

    if (roler.commandName == 'org') {
        const targetUser = roler.user;
        const member = roler.guild.members.cache.get(targetUser.id);

        // Obtén el ID del rol del usuario que ejecutó el comando
        const userRoleId = member.roles.highest.id;

        const rolesToExclude = [
            roler.guild.roles.everyone.id,
            '1030669695252176949',
            '1030253037714935878',
            '980946990206689401',
            '1030257183612477502',
            '980947504348684378',
            '980961426892030052',
            '1098762313147883541',
            '1115379504504913930',
            '1117993173483012196',
            '1129213031600115793',
            '1138636945656922212',
            '1147010546676269176',
            '1147284837670060093',
            '1154546362311004251',
            '1159214905317142569',
            '1164007832518148157',
            '1167259450751602718'
        ]; // Agrega los IDs de los roles a excluir

        // Filtra el userRoleId para excluir los roles específicos
        let filteredRoleId = rolesToExclude.includes(userRoleId) ? null : userRoleId;

        // Si el filteredRoleId es null, busca el siguiente rol válido
        if (filteredRoleId === null) {
            for (const roleId of member.roles.cache.keys()) {
                if (!rolesToExclude.includes(roleId)) {
                    filteredRoleId = roleId;
                    break;
                }
            }
        }

        const roles = member.roles.cache
            .filter(role => filteredRoleId !== null && !rolesToExclude.includes(role.id)) // Filtra por ID en lugar de nombre
            .map(role => role.toString())
            .join(', ') || 'Este usuario no tiene roles.';

        const imageUrl = fotoOrg[filteredRoleId] || "https://media.tenor.com/nkGQuXoHpogAAAAC/auxilio-me.gif";

        const result = new EmbedBuilder()
            .setTitle("<a:alien:1149715395226390689> Representando <a:alien:1149715395226390689>")
            .setDescription(`${targetUser.toString()} Esta representando a ${roles}`)
            .setColor('#FF0000')
            .setImage(imageUrl)
            .setFooter({
                text: "Powered by DominicanYorkRP"
            });

        await roler.reply({ embeds: [result] });
    }
});



client.login(config.token)
console.log("El bot esta funcionando")