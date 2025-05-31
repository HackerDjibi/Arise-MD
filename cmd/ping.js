const { delay } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'ping',
    category: 'outils',
    react: '🏓',
    description: 'Vérifie la latence du bot et son statut',
    execute: async (sock, msg) => {
        const { key } = msg;
        const startTime = Date.now();
        
        try {
            // Envoi initial
            await sock.sendMessage(
                key.remoteJid, 
                { text: '🏓 _Ping en cours..._' },
                { quoted: msg }
            );

            // Calcul latence
            const latency = Date.now() - startTime;

            // Vérification statut
            const botStatus = latency < 500 ? '🟢 Excellent' : 
                             latency < 1000 ? '🟡 Moyen' : '🔴 Lent';

            // Message de résultat
            const resultMessage = `
⏱️ *Résultats du Ping* ⏱️

🏓 Pong !
📶 Latence: ${latency}ms
📊 Statut: ${botStatus}

💡 _Le bot fonctionne correctement_
            `.trim();

            // Modification du message initial
            await sock.sendMessage(
                key.remoteJid,
                { 
                    edit: {
                        key: msg.key,
                        message: {
                            conversation: resultMessage
                        }
                    }
                }
            );

            // Réaction
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
            console.error('Erreur ping:', error);
            await sock.sendMessage(
                key.remoteJid,
                {
                    text: '❌ Échec du test de ping',
                    quoted: msg
                }
            );
        }
    }
};