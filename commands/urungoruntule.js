const { Client, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");
const db = require("croxydb");
// discord.gg/altyapilar - Lourity
module.exports = {
    name: "ürüngörüntüle",
    description: 'Kimliğini girdiğin ürünü görüntülersin.',
    type: 1,
    options: [
        {
            name: "ürün-kimliği",
            description: "Görüntülemek istediğiniz ürün kimliğini girin.",
            type: 10,
            required: true
        },
    ],
    run: async (client, interaction) => {
        const productId = interaction.options.getNumber('ürün-kimliği')

        const productData = db.get(`product_${productId}`);

        const noProduct = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Girdiğiniz kimliğe ait bir ürün bulunmamaktadır.")

        if (!productData) return interaction.reply({ embeds: [noProduct], ephemeral: true })

        const imagePath = `./productPhotos/${productId}.png`

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
}