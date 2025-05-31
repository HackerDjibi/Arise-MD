const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'test',
    category: 'Général',
    react: '🤖',
    description: 'Affiche les informations du bot',
    execute: async (sock, msg) => {
        const { key } = msg;
        const PREFIX = process.env.PREFIX || '!';

        try {
            // Chemin de l'image (remplacez par votre chemin)
            const imagePath = path.join(__dirname, '../media/menu.jpg');
            
            // Vérifier si l'image existe
            const imageExists = fs.existsSync(imagePath);

            // Message texte
            const botInfo = `
🌟 *Présentation du Bot* 🌟

Bonjour ! Je suis ARISE-MD ub bot WhatsApp multifonction conçu pour vous aider.

Fonctionnalités principales :
✅ Gestion des commandes
✅ Réponses intelligentes
✅ Outils pratiques

Utilisez *${PREFIX}menu* pour voir toutes les commandes disponibles.

📌 *Astuce* : Taper *${PREFIX}help [commande]* pour plus d'info sur une commande spécifique.
            `.trim();

            // Envoyer l'image si elle existe
            if (imageExists) {
                await sock.sendMessage(
                    key.remoteJid,
                    {
                        image: fs.readFileSync(imagePath),
                        caption: botInfo,
                        mimetype: 'image/jpeg'
                    },
                    { quoted: msg }
                );
            } else {
                // Fallback texte si pas d'image
                await sock.sendMessage(
                    key.remoteJid,
                    { text: botInfo },
                    { quoted: msg }
                );
            }

            // Ajouter une réaction
            await sock.sendMessage(
                key.remoteJid,
                {
                    react: {
                        text: this.react,
                        key: msg.key
                    }
                }
            );

        } catch (error) {
            console.error('Erreur dans la commande test:', error);
            await sock.sendMessage(
                key.remoteJid,
                {
                    text: '❌ Une erreur est survenue lors de l\'affichage des informations',
                    quoted: msg
                }
            );
        }
    }
};