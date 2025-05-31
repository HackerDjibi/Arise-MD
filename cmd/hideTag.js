// module.exports = {
//     name: 'tag',
//     description: 'Envoie un message avec des mentions invisibles pour tous les membres du groupe, puis renvoie le message sans les tags',
//     execute: async (sock, msg) => {
//         const { key, message } = msg;

//         try {
//             // Récupérer les métadonnées du groupe
//             const groupMetadata = await sock.groupMetadata(key.remoteJid);
//             const participants = groupMetadata.participants;

//             // Extraire les JIDs des participants
//             const mentions = participants.map(participant => participant.id);

//             // Récupérer le texte du message envoyé par l'utilisateur
//             const messageContent = message.conversation || message.extendedTextMessage?.text || 'Message par défaut';

//             // Envoyer un message avec des mentions invisibles
//             await sock.sendMessage(key.remoteJid, {
//                 text: messageContent, // Texte personnalisé
//                 mentions: mentions // Mentions invisibles
//             });

//             // Attendre un court délai avant d'envoyer le message sans tags
//             setTimeout(async () => {
//                 // Envoyer le message sans mentions
//                 await sock.sendMessage(key.remoteJid, {
//                     text: messageContent // Texte sans mentions
//                 });
//             }, 1000); // Délai de 1 seconde
//         } catch (error) {
//             console.error('Erreur lors de l\'envoi du tag invisible :', error);
//             await sock.sendMessage(key.remoteJid, { text: '❌ Une erreur est survenue lors de l\'envoi du tag invisible.' });
//         }
//     }
// };