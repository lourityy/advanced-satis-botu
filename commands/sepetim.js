const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");
const db = require("croxydb");
// discord.gg/altyapilar - Lourity
module.exports = {
    name: "sepetim",
    description: 'Sepetine eklediğin ürünleri görüntülersin.',
    type: 1,
    options: [],
    run: async (client, interaction) => {

        /** @type {import("../types/urunler").Urunler[]} */
        const memberBasket = db.get(`sepet_${interaction.user.id}`)

        const noRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Tümünü Satın Al")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("allSell")
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

        if (!memberBasket) return interaction.reply({ embeds: [noProducts], components: [noRow], ephemeral: true });

        try {
            const main_data = memberBasket.map((urun) => `Kimlik: \`${urun.id}\` **|** Ad: \`${urun.name}\` **|** Açıklama: \`${urun.description}\` **|** Fiyat: \`${urun.price}₺\``)
            const totalPriceData = memberBasket.map((urun) => parseFloat(urun.price));
            const totalPrice = totalPriceData.reduce((accumulator, currentValue) => accumulator + currentValue, 0);


            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Tümünü Satın Al")
                        .setStyle(ButtonStyle.Success)
                        .setCustomId("allSell")
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

            interaction.reply({ embeds: [basketProducts], components: [row], ephemeral: true });
        } catch {
            const error = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Bir hata oluştu, lütfen tekrar deneyin.")

            return interaction.reply({ embeds: [error], ephemeral: true })
        }
    }
}