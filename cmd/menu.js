const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'menu',
    aliases: ['aide', 'cmds'],
    react: '📜',
    description: 'Affiche le menu visuel du bot',
    execute: async (sock, msg) => {
        const { key } = msg;
        const PREFIX = process.env.PREFIX || '!';
        const BOT_NAME = process.env.BOT_NAME || 'Arise-MD';
        const IMAGE_PATH = path.join(__dirname, '../media/menu.jpg');

        try {
            // 1. Réaction immédiate
            await sock.sendMessage(key.remoteJid, {
                react: { text: this.react, key: msg.key }
            });

            // 2. Charger les commandes
            const commandFiles = fs.readdirSync(__dirname)
                .filter(file => file.endsWith('.js') && file !== 'menu.js');

            const categories = {};
            
            for (const file of commandFiles) {
                const cmd = require(`./${file}`);
                if (cmd.name && cmd.execute) {
                    const category = cmd.category || 'Général';
                    categories[category] = [...(categories[category] || []), cmd.name];
                }
            }

            // 3. Construire le texte du menu
            let menuText = `*${BOT_NAME}*  │  Préfixe: ${PREFIX}\n\n`;

            Object.keys(categories).sort().forEach(category => {
                menuText += `◇◇◇ ${category.toUpperCase()} ◇◇◇\n`;
                
                // Afficher 2 commandes par ligne pour économiser de l'espace
                const commands = categories[category].sort();
                for (let i = 0; i < commands.length; i += 2) {
                    const cmd1 = commands[i] ? `• ${PREFIX}${commands[i].padEnd(15)}` : '';
                    const cmd2 = commands[i+1] ? `• ${PREFIX}${commands[i+1]}` : '';
                    menuText += `${cmd1} ${cmd2}\n`;
                }
                
                menuText += `\n`;
            });

            menuText += `Créé par ${process.env.DEV_NAME || 'l\'équipe Arise'}`;

            // 4. Envoyer avec image ou texte seul
            if (fs.existsSync(IMAGE_PATH)) {
                await sock.sendMessage(key.remoteJid, {
                    image: {
                        url: IMAGE_PATH // Utilisation du chemin local
                    },
                    caption: menuText,
                    mimetype: 'image/jpeg',
                    contextInfo: {
                        mentionedJid: [msg.key.participant || msg.key.remoteJid]
                    }
                }, { quoted: msg });
            } else {
                // Version texte seule si image manquante
                await sock.sendMessage(key.remoteJid, {
                    text: `📜 *${BOT_NAME}*\n\n${menuText}`,
                    quoted: msg
                });
                console.warn('Avertissement: Image du menu non trouvée à', IMAGE_PATH);
            }

        } catch (error) {
            console.error('Erreur dans la commande menu:', error);
            await sock.sendMessage(key.remoteJid, {
                text: '❌ Impossible d\'afficher le menu complet',
                quoted: msg
            });
        }
    }
};