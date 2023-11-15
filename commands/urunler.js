const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");
const db = require("croxydb");
// discord.gg/altyapilar - Lourity
module.exports = {
    name: "ürünler",
    description: 'Marketteki ürünleri görüntülersin.',
    type: 1,
    options: [],
    run: async (client, interaction) => {

        /** @type {import("../types/urunler").Urunler[]} */
        const products_data = db.get(`products_${interaction.guild.id}`)

        const noProducts = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Sisteme hiç ürün eklenmemiş, lütfen daha sonra tekrar deneyin.")

        if (!products_data) return interaction.reply({ embeds: [noProducts], ephemeral: true })

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

            interaction.reply({ embeds: [products], components: [row], ephemeral: true });
        } catch {
            const error = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Bir hata oluştu, lütfen tekrar deneyin.")

            return interaction.reply({ embeds: [error], ephemeral: true })
        }
    }
}