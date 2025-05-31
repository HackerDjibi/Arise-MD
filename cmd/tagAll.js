const { react } = require("./menu");

module.exports = {
    name: 'tagall',
    react: '👥',
    description: 'Mentionne tous les utilisateurs du groupe avec leur numéro de téléphone',
    execute: async (sock, msg) => {
        const { key } = msg;

        try {
            // Récupérer les métadonnées du groupe
            const groupMetadata = await sock.groupMetadata(key.remoteJid);
            const participants = groupMetadata.participants;

            // Extraire les numéros de téléphone des participants
            const mentions = participants.map(participant => participant.lid);
            const mentionText = mentions
                .map(id => `@${id.split('@')[0]}`) // Formater les numéros sans @s.whatsapp.net
                .join('\n');

            // Envoyer le message avec les mentions
            await sock.sendMessage(key.remoteJid, {
                text: `*Invocations*\n${mentionText}`,
                mentions: mentions // Inclure les mentions dans le message
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi des mentions :', error);
            await sock.sendMessage(key.remoteJid, { text: '❌ Une erreur est survenue lors de l\'envoi des mentions.' });
        }
        try {
            // Ajouter une réaction au message de commande
            await sock.sendMessage(key.remoteJid, {
                react: {
                    text: '👥', // Emoji de réaction
                    key: key // Référence au message de la commande
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la réaction :', error);
            await sock.sendMessage(key.remoteJid, { text: '❌ Une erreur est survenue lors de l\'ajout de la réaction.' });
        }
    }
};