const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");
const db = require("croxydb");
const fs = require('fs');
const axios = require("axios");
// discord.gg/altyapilar - Lourity
module.exports = {
    name: "ürünekle",
    description: 'Markete yeni ürün eklersin.',
    type: 1,
    options: [
        {
            name: "ürün-ismi",
            description: "Ürüne vereceğiniz isim.",
            type: 3,
            required: true
        },
        {
            name: "ürün-fiyatı",
            description: "Ürüne vereceğiniz fiyat.",
            type: 3,
            required: true
        },
        {
            name: "ürün-görsel",
            description: "Ürünün görseli.",
            type: 11,
            required: true
        },
        {
            name: "ürün-açıklaması",
            description: "Ürün açıklaması.",
            type: 3,
            required: true
        },
    ],
    run: async (client, interaction) => {

        const noPerm = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Yeterli yetkiye sahip değilsiniz.")

        if (!interaction.member.roles.cache.has(config.permrole)) return interaction.reply({ embeds: [noPerm], ephemeral: true })

        try {
            const productName = interaction.options.getString('ürün-ismi')
            const productPrice = interaction.options.getString('ürün-fiyatı')
            const productPhoto = interaction.options.getAttachment('ürün-görsel')
            const productDescription = interaction.options.getString('ürün-açıklaması')

            function generateRandomNumber() {
                return Math.floor(1000 + Math.random() * 9000);
            }
            var randomNumber = generateRandomNumber();

            const productAdded = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setDescription(`🏷️ \`${productName}\` ismiyle ürün başarıyla eklendi, bilgileri aşağıda sıralanmıştır.`)
                .addFields(
                    { name: 'Ürün İsmi:', value: `${productName}`, inline: true },
                    { name: 'Ürün Fiyatı:', value: `**${productPrice}₺**`, inline: true },
                    { name: 'Ürün Kodu:', value: `\`\`\`${randomNumber}\`\`\``, inline: true },
                    { name: 'Ürün Açıklaması:', value: `${productDescription}` },
                )
                .setImage(productPhoto.url)


            const response = await axios.get(productPhoto.url, { responseType: 'arraybuffer' });
            fs.writeFileSync(`./productPhotos/${randomNumber}.png`, response.data, 'binary');

            db.set(`product_${randomNumber}`, { productName: productName, productPrice: productPrice, productDescription: productDescription });
            db.push(`products_${interaction.guild.id}`, {
                id: randomNumber,
                name: productName,
                description: productDescription,
                price: productPrice,
            })
            interaction.reply({ embeds: [productAdded] });
        } catch (e){
            const error = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Bir hata oluştu, lütfen tekrar deneyin.")
            console.log(e)
            return interaction.reply({ embeds: [error], ephemeral: true })
        }
    }
}
