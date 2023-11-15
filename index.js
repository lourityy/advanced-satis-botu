// Discord
const { PermissionsBitField, EmbedBuilder, AttachmentBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder, AuditLogEvent } = require("discord.js");

// İNTENTS
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember] });

const PARTIALS = Object.values(Partials);
const Discord = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
// Database
const db = require("croxydb")
// discord.gg/altyapilar - Lourity
global.client = client;
client.commands = (global.commands = []);
const { readdirSync } = require("fs")
const { token } = require("./config.json");
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: false,
        type: 1
    });

    console.log(`[COMMAND] ${props.name} komutu yüklendi.`)

});
readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(`[EVENT] ${name} eventi yüklendi.`)
});


client.login(token)

// Bir Hata Oluştu
process.on("unhandledRejection", (reason, p) => {
    console.log(reason, p);
})

process.on("unhandledRejection", async (error) => {
    return console.log("Bir hata oluştu! " + error)
})
//
//
//

client.on("interactionCreate", async interaction => {

    const productModal = new ModalBuilder()
        .setCustomId('form')
        .setTitle('Ürün Görüntüle')
    const addForm = new TextInputBuilder()
        .setCustomId('textmenu')
        .setLabel('Ürünün Kimliğini Giriniz')
        .setStyle(TextInputStyle.Short)
        .setMinLength(4)
        .setMaxLength(4)
        .setPlaceholder('Ürünün Kimliği (0000)')
        .setRequired(true)

    const modalRow = new ActionRowBuilder().addComponents(addForm);
    productModal.addComponents(modalRow);

    if (interaction.customId === 'urungoruntule') {
        await interaction.showModal(productModal);
    }

    if (interaction.customId === 'form') {
        const productId = interaction.fields.getTextInputValue("textmenu");

        const productData = db.get(`product_${productId}`);

        const noProduct = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Girdiğiniz kimliğe ait bir ürün bulunmamaktadır.")

        if (!productData) return interaction.reply({ embeds: [noProduct], ephemeral: true })

        const imagePath = `productPhotos/${productId}.png`

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ürünü Satın Al")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("sell")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ürünü Sepete Ekle")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("addBasket")
            )

        const file = new AttachmentBuilder(imagePath);
        const productDataEmbed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription(`🏷️ \`${productId}\` kimliğine ait ürünün bilgileri aşağıda sıralanmıştır.`)
            .addFields(
                { name: 'Ürün İsmi:', value: `${productData.productName}`, inline: true },
                { name: 'Ürün Fiyatı:', value: `**${productData.productPrice}₺**`, inline: true },
                { name: 'Ürün Kodu:', value: `\`\`\`${productId}\`\`\``, inline: true },
                { name: 'Ürün Açıklaması:', value: `${productData.productDescription}` },
            )
            .setImage(`attachment://${productId}.png`)

        interaction.reply({ content: `${productId}`, embeds: [productDataEmbed], files: [file], components: [row], ephemeral: true })
    }

    if (interaction.customId === 'sell') {
        const productData = db.get(`product_${interaction.message.content}`);

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('a1')
                    .setPlaceholder('Ödeme yöntemini seçiniz.')
                    .addOptions([
                        {
                            label: "Papara",
                            description: "Verilen papara id'sine ücreti gönderirsiniz.",
                            value: "papara"
                        },
                        {
                            label: "İninal",
                            description: "Verilen ininal id'sine ücreti gönderirsiniz.",
                            value: "ininal"
                        },
                    ])

            )

        const sellEmbed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription(`🏷️ \`${productData.productName}\` adlı ürünü satın alıyorsunuz, aşağıdaki menüden ödeme yöntemini seçiniz.\n\n💵 Ödenecek Tutar: \`${productData.productPrice} ₺\``)

        interaction.update({ files: [], embeds: [sellEmbed], components: [row] })
    }
// discord.gg/altyapilar - Lourity
    if (interaction.customId === 'allSell') {
        const memberBasket = db.get(`sepet_${interaction.user.id}`)
        const main_data = memberBasket.map((urun) => `🏷️ \`${urun.name}\``)
        const main_price = memberBasket.map((urun) => urun.price)
        const general_price = main_price.reduce((acc, current) => {
            return acc + Number(current);
        }, 0);

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('a1')
                    .setPlaceholder('Ödeme yöntemini seçiniz.')
                    .addOptions([
                        {
                            label: "Papara",
                            description: "Verilen papara id'sine ücreti gönderirsiniz.",
                            value: "papara_all"
                        },
                        {
                            label: "İninal",
                            description: "Verilen ininal id'sine ücreti gönderirsiniz.",
                            value: "ininal_all"
                        },
                    ])

            )

        const sellEmbed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription(`${main_data.join('\n')}\nadlı ürünleri satın alıyorsunuz, aşağıdaki menüden ödeme yöntemini seçiniz.\n\n💵 Ödenecek Tutar: \`${general_price}\``)

        interaction.update({ files: [], embeds: [sellEmbed], components: [row] })
    }

    if (interaction.isStringSelectMenu()) {

        if (interaction.values[0] === 'papara_all') {
            interaction.guild.channels.create({
                name: `talep-${interaction.user.username}`,
                type: Discord.ChannelType.GuildText,
                parent: config.destekkategori,

                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [Discord.PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: config.permrole,
                        allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            }).then((ch) => {
                const updateEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setDescription(`Satın alım talebi oluşturuldu <#${ch.id}>`)

                interaction.update({ content: " ", embeds: [updateEmbed], components: [] });

                const memberBasket = db.get(`sepet_${interaction.user.id}`)
                const main_data = memberBasket.map((urun) => `${urun.name}`)
                const main_price = memberBasket.map((urun) => urun.price)
                const general_price = main_price.reduce((acc, current) => {
                    return acc + Number(current);
                }, 0);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Siparişi Onayla")
                            .setStyle(ButtonStyle.Success)
                            .setCustomId("productApprove")
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Siparişi İptal Et")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId("productCancel")
                    )

                const sellTicket = new EmbedBuilder()
                    .setColor("Blurple")
                    .setAuthor({ name: `${interaction.user.username} adlı kişinin satın alım talebi`, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`:dollar: ${interaction.user} bir satın alım talebi oluşturdu!`)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields(
                        { name: "Açılma Zamanı:", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    )

                const productEmbed = new EmbedBuilder()
                    .setColor("Blurple")
                    .addFields(
                        { name: "Ürünlerin Adı:", value: `${main_data.join(', ')}`, inline: true },
                        { name: "Ödenecek Tutar:", value: `**${general_price}₺**`, inline: true },
                        { name: "Papara ID:", value: `\`\`\`${config.papara}\`\`\``, inline: true },
                    )

                ch.send({ content: `${interaction.user} yetkililerimiz siparişini onayladığında işlemler başlayacaktır. (<@&${config.permrole}>)`, embeds: [sellTicket, productEmbed], components: [row] }).then((msg) => {
                    db.set(`ticketMember_${ch.id}`, { user: interaction.user.id, message: msg.id })
                })
            })
        }


        if (interaction.values[0] === 'ininal_all') {
            interaction.guild.channels.create({
                name: `talep-${interaction.user.username}`,
                type: Discord.ChannelType.GuildText,
                parent: config.destekkategori,

                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [Discord.PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: config.permrole,
                        allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            }).then((ch) => {
                const updateEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setDescription(`Satın alım talebi oluşturuldu <#${ch.id}>`)

                interaction.update({ content: " ", embeds: [updateEmbed], components: [] });

                const memberBasket = db.get(`sepet_${interaction.user.id}`)
                const main_data = memberBasket.map((urun) => `${urun.name}`)
                const main_price = memberBasket.map((urun) => urun.price)
                const general_price = main_price.reduce((acc, current) => {
                    return acc + Number(current);
                }, 0);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Siparişi Onayla")
                            .setStyle(ButtonStyle.Success)
                            .setCustomId("productApprove")
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Siparişi İptal Et")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId("productCancel")
                    )

                const sellTicket = new EmbedBuilder()
                    .setColor("Blurple")
                    .setAuthor({ name: `${interaction.user.username} adlı kişinin satın alım talebi`, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`:dollar: ${interaction.user} bir satın alım talebi oluşturdu!`)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields(
                        { name: "Açılma Zamanı:", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    )

                const productEmbed = new EmbedBuilder()
                    .setColor("Blurple")
                    .addFields(
                        { name: "Ürünlerin Adı:", value: `${main_data.join(', ')}`, inline: true },
                        { name: "Ödenecek Tutar:", value: `**${general_price}₺**`, inline: true },
                        { name: "Papara ID:", value: `\`\`\`${config.ininal}\`\`\``, inline: true },
                    )

                ch.send({ content: `${interaction.user} yetkililerimiz siparişini onayladığında işlemler başlayacaktır. (<@&${config.permrole}>)`, embeds: [sellTicket, productEmbed], components: [row] }).then((msg) => {
                    db.set(`ticketMember_${ch.id}`, { user: interaction.user.id, message: msg.id })
                })
            })
        }


        if (interaction.values[0] === 'papara') {
            interaction.guild.channels.create({
                name: `talep-${interaction.user.username}`,
                type: Discord.ChannelType.GuildText,
                parent: config.destekkategori,

                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [Discord.PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: config.permrole,
                        allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            }).then((ch) => {
                const updateEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setDescription(`Satın alım talebi oluşturuldu <#${ch.id}>`)

                interaction.update({ content: " ", embeds: [updateEmbed], components: [] });

                const productData = db.get(`product_${interaction.message.content}`);
                const ticketData = db.get(`ticket_${interaction.guild.id}`);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Siparişi Onayla")
                            .setStyle(ButtonStyle.Success)
                            .setCustomId("productApprove")
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Siparişi İptal Et")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId("productCancel")
                    )

                const sellTicket = new EmbedBuilder()
                    .setColor("Blurple")
                    .setAuthor({ name: `${interaction.user.username} adlı kişinin satın alım talebi`, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`:dollar: ${interaction.user} bir satın alım talebi oluşturdu!`)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields(
                        { name: "Açılma Zamanı:", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                        { name: "Alınan Ürün Kimliği:", value: `${interaction.message.content}`, inline: true },
                    )

                const productEmbed = new EmbedBuilder()
                    .setColor("Blurple")
                    .addFields(
                        { name: "Ürün Adı:", value: `${productData.productName}`, inline: true },
                        { name: "Ödenecek Tutar:", value: `**${productData.productPrice}₺**`, inline: true },
                        { name: "Papara ID:", value: `\`\`\`${config.papara}\`\`\``, inline: true },
                    )

                ch.send({ content: `${interaction.user} yetkililerimiz siparişini onayladığında işlemler başlayacaktır. (<@&${config.permrole}>)`, embeds: [sellTicket, productEmbed], components: [row] }).then((msg) => {
                    db.set(`ticketMember_${ch.id}`, { user: interaction.user.id, message: msg.id })
                })
            })
        }


        if (interaction.values[0] === 'ininal') {
            interaction.guild.channels.create({
                name: `talep-${interaction.user.username}`,
                type: Discord.ChannelType.GuildText,
                parent: config.destekkategori,

                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [Discord.PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: config.permrole,
                        allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            }).then((ch) => {
                const updateEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setDescription(`Satın alım talebi oluşturuldu <#${ch.id}>`)

                interaction.update({ content: " ", embeds: [updateEmbed], components: [] });

                const productData = db.get(`product_${interaction.message.content}`);
                const ticketData = db.get(`ticket_${interaction.guild.id}`);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Siparişi Onayla")
                            .setStyle(ButtonStyle.Success)
                            .setCustomId("productApprove")
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Siparişi İptal Et")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId("productCancel")
                    )

                const sellTicket = new EmbedBuilder()
                    .setColor("Blurple")
                    .setAuthor({ name: `${interaction.user.username} adlı kişinin satın alım talebi`, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`:dollar: ${interaction.user} bir satın alım talebi oluşturdu!`)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields(
                        { name: "Açılma Zamanı:", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                        { name: "Alınan Ürün Kimliği:", value: `${interaction.message.content}`, inline: true },
                    )

                const productEmbed = new EmbedBuilder()
                    .setColor("Blurple")
                    .addFields(
                        { name: "Ürün Adı:", value: `${productData.productName}`, inline: true },
                        { name: "Ödenecek Tutar:", value: `**${productData.productPrice}₺**`, inline: true },
                        { name: "İninal ID:", value: `\`\`\`${config.ininal}\`\`\``, inline: true },
                    )

                ch.send({ content: `${interaction.user} yetkililerimiz siparişini onayladığında işlemler başlayacaktır. (<@&${config.permrole}>)`, embeds: [sellTicket, productEmbed], components: [row] }).then((msg) => {
                    db.set(`ticketMember_${ch.id}`, { user: interaction.user.id, message: msg.id })
                })
            })
        }
    }

    if (interaction.customId === 'productApprove') {
        const noPerm = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Yeterli yetkiye sahip değilsiniz.")

        if (!interaction.member.roles.cache.has(config.permrole)) return interaction.reply({ embeds: [noPerm], ephemeral: true })

        const ticketMember = db.get(`ticketMember_${interaction.channel.id}`).user

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ödemeyi Yaptım")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("yesMoney")
            )

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Siparişi Onayla")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("productApprove")
                    .setDisabled(true)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Siparişi İptal Et")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("productCancel")
            )

        const approveEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setAuthor({ name: `${interaction.user.username} siparişi onayladı`, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`Sipariş onaylandı, ödemeyi yapmanız bekleniyor. *Bilgiler üst kısımda mevcuttur.*`)

        interaction.update({ components: [row2] }).then((result) => {
            interaction.channel.send({ content: `<@${ticketMember}>`, embeds: [approveEmbed], components: [row] }).catch(e => { })
        })
    }

    if (interaction.customId === 'yesMoney') {
        const ticketMember = db.get(`ticketMember_${interaction.channel.id}`);

        if (!interaction.user.id === ticketMember.user) return;

        const messageID = ticketMember.message;
        const mainMessage = await interaction.channel.messages.fetch(messageID);

        const updatedRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Siparişi Onayla")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("productApprove")
                    .setDisabled(true)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Siparişi İptal Et")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("productCancel")
                    .setDisabled(true)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Kaydet ve Sonlandır")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("ticketEnd")
            )

        const approveEmbed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`<@${ticketMember.user}> ödemeyi yaptığını belirtti, sipariş teslim edilebilir.`)

        mainMessage.edit({ components: [updatedRow] })
        interaction.update({ content: `<@&${config.permrole}>`, embeds: [approveEmbed], components: [] })
    }

    if (interaction.customId === 'productCancel') {
        const productCancelEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`${interaction.user} siparişin iptal edilmesini talep etti, \`10 saniye\` sonra edilecektir.`)

        db.delete(`ticketMember_${interaction.channel.id}`)
        interaction.reply({ embeds: [productCancelEmbed] })
        setTimeout(() => {
            interaction.channel.delete().catch(e => { })
        }, 10000);
    }

    if (interaction.customId === 'addBasket') {
        /** @type {import("./types/sepet").Sepet[]} */
        const memberBasket = db.get(`sepet_${interaction.user.id}`);

        const updateRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ürün Zaten Ekli")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)
                    .setCustomId("addBasket")
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Sepeti Görüntüle")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("basket")
            )

        if (memberBasket) {
            if (memberBasket.map((urun) => urun.id).includes(interaction.message.content)) return interaction.update({ components: [updateRow] })
        }

        const updatedRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ürün Sepete Eklendi")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true)
                    .setCustomId("addBasket")
            )


        const productsSearchData = db.get(`product_${interaction.message.content}`)
        db.push(`sepet_${interaction.user.id}`, { id: interaction.message.content, name: productsSearchData.productName, description: productsSearchData.productDescription, price: productsSearchData.productPrice })
        interaction.update({ components: [updatedRow] })
    }

    if (interaction.customId === 'deleteBasket') {
        db.delete(`sepet_${interaction.user.id}`)

        const updatedRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Tümünü Satın Al")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("sell")
                    .setDisabled(true)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Sepeti Boşalt")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("deleteBasket")
                    .setDisabled(true)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ürün Görüntüle")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("urungoruntule")
                    .setDisabled(true)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ürünler")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("urunler")
            )

        const updatedBasketProducts = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setTitle("₺ Sepetim $")
            .setDescription(`Sepet boş gözüküyor 😵\n\nToplam Ödenecek Tutar: \`0 ₺\``)

        interaction.update({ embeds: [updatedBasketProducts], components: [updatedRow] });
    }

    if (interaction.customId === 'urunler') {
        /** @type {import("../types/urunler").Urunler[]} */
        const products_data = db.get(`products_${interaction.guild.id}`)

        const noProducts = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Sisteme hiç ürün eklenmemiş, lütfen daha sonra tekrar deneyin.")

        if (!products_data) return interaction.update({ embeds: [noProducts], ephemeral: true })

        try {
            const main_data = products_data.map((urun) => `Kimlik: \`${urun.id}\` **|** Ad: \`${urun.name}\` **|** Açıklama: \`${urun.description}\` **|** Fiyat: \`${urun.price}₺\``)

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Ürün Görüntüle")
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId("urungoruntule")
                )

            const products = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setTitle("₺ Ürün Listesi $")
                .setDescription(`${main_data.join('\n')}`)

            interaction.update({ embeds: [products], components: [row], ephemeral: true });
        } catch {
            const error = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Bir hata oluştu, lütfen tekrar deneyin.")

            return interaction.update({ embeds: [error], ephemeral: true })
        }
    }

    if (interaction.customId === 'basket') {
        /** @type {import("./types/urunler").Urunler[]} */
        const memberBasket = db.get(`sepet_${interaction.user.id}`)

        const noRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Tümünü Satın Al")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("sell")
                    .setDisabled(true)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Sepeti Boşalt")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("deleteBasket")
                    .setDisabled(true)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ürün Görüntüle")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("urungoruntule")
                    .setDisabled(true)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ürünler")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("urunler")
            )

        const noProducts = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setTitle("₺ Sepetim $")
            .setDescription(`Sepet boş gözüküyor 😵\n\nToplam Ödenecek Tutar: \`0 ₺\``)

        if (!memberBasket) return interaction.update({ content: " ", files: [], embeds: [noProducts], components: [noRow], ephemeral: true });

        try {
            const main_data = memberBasket.map((urun) => `Kimlik: \`${urun.id}\` **|** Ad: \`${urun.name}\` **|** Açıklama: \`${urun.description}\` **|** Fiyat: \`${urun.price}₺\``)
            const totalPriceData = memberBasket.map((urun) => parseFloat(urun.price));
            const totalPrice = totalPriceData.reduce((accumulator, currentValue) => accumulator + currentValue, 0);


            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Tümünü Satın Al")
                        .setStyle(ButtonStyle.Success)
                        .setCustomId("sell")
                )
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Sepeti Boşalt")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId("deleteBasket")
                )
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Ürün Görüntüle")
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId("urungoruntule")
                )

            const basketProducts = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setTitle("₺ Sepetim $")
                .setDescription(`${main_data.join('\n')}\n\nToplam Ödenecek Tutar: \`${totalPrice} ₺\``)

            interaction.update({ content: " ", embeds: [basketProducts], files: [], components: [row], ephemeral: true });
        } catch {
            const error = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Bir hata oluştu, lütfen tekrar deneyin.")

            return interaction.update({ content: " ", files: [], embeds: [error], ephemeral: true })
        }
    }



    if (interaction.customId === "ticketEnd") {
        if (!interaction.member.roles.cache.has(config.permrole)) return await interaction.deferUpdate()

        const ticketMember = db.get(`ticketMember_${interaction.channel.id}`)
        if (!ticketMember) return interaction.channel.delete()
        const user = await interaction.guild.members.fetch(ticketMember.user);

        const message_button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("📝")
                    .setLabel("Mesajlar")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("ticket_message")
            )

        const log = new EmbedBuilder()
            .setColor("Yellow")
            .setAuthor({ name: `${user.user.username} kişisinin talebi`, iconURL: user.user.displayAvatarURL() })
            .setDescription(`${interaction.user} tarafından __kaydedilerek__ kapatıldı!`)
            .addFields(
                { name: "⏲", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: "🏷️", value: `__${interaction.channel.name}__`, inline: true },
            )
            .setThumbnail(user.user.displayAvatarURL())

        client.channels.cache.get(config.log).send({ embeds: [log], components: [message_button] }).then((message) => {
            const ticket_messages = db.fetch(`ticket_messages_${interaction.channel.id}`)
            if (ticket_messages) {
                const messages = ticket_messages.join("\n")
                if (messages) {
                    fs.writeFileSync(`./productMessages/${message.id}-talep.txt`, messages)
                }
            }
        })

        const deleted_channel = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`Talep **5 saniye** içerisinde silinecektir. (${interaction.user.username} tarafından)`)

        await interaction.deferUpdate();
        interaction.channel.send({ embeds: [deleted_channel] })

        setTimeout(() => {
            db.delete(`ticketMember_${interaction.channel.id}`)
            db.delete(`ticket_messages_${interaction.channel.id}`)
            interaction.channel.delete().catch(e => { })
        }, 5000);
    }


    if (interaction.customId === "ticket_message") {
        if (fs.existsSync(`./productMessages/${interaction.message.id}-talep.txt`)) {
            interaction.reply({ files: [`./productMessages/${interaction.message.id}-talep.txt`], ephemeral: true })
        } else {
            const message_button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setEmoji("📝")
                        .setLabel("Mesajlar")
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId("ticket_message")
                        .setDisabled(true)
                )

            interaction.update({ components: [message_button] })
        }
    }
})

client.on("messageCreate", async message => {
    if (message.channel.name.includes("talep-")) {
        if (message.author?.bot) return;
        db.push(`ticket_messages_${message.channel.id}`, `${message.author.username} : ${message.content}`)
    }
})
// discord.gg/altyapilar - Lourity