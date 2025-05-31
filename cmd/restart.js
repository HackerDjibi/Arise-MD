const { exec } = require('child_process');

module.exports = {
    name: 'restart',
    aliases: ['rst'],
    description: 'Met à jour le bot avec les dernières modifications',
    execute: async (sock, msg) => {
        const { key } = msg;
        const updateMessage = `\n\*Redemarrage du bot en cours...*`;

        // Envoie le message de mise à jour
        await sock.sendMessage(key.remoteJid, { text: updateMessage });

        // Redémarre le bot avec pm2
        exec('pm2 restart all', (error, stdout, stderr) => {
            if (error) {
                console.error(`Erreur lors du redémarrage : ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Erreur : ${stderr}`);
                return;
            }
            console.log(`Redémarrage réussi : ${stdout}`);
        });
    }
}