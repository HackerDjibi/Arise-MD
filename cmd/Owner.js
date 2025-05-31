const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'owner',
    aliases: ['créateur', 'admin', 'contact'], // Alias supplémentaires
    react: '👑',
    description: 'Affiche les informations de contact du propriétaire du bot',
    execute: async (sock, msg) => {
        const { key } = msg;
        
        try {
            // Vérification des variables d'environnement
            if (!process.env.OWNER_NAME || !process.env.OWNER_NUMBER) {
                throw new Error('Configuration du propriétaire manquante');
            }

            const ownerName = process.env.OWNER_NAME || 'Propriétaire du bot';
            const ownerNumber = process.env.OWNER_NUMBER.replace(/[^0-9]/g, ''); // Nettoyage du numéro
            const ownerEmail = process.env.OWNER_EMAIL || '';

            // Formatage de la vCard
            let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
`;

            // Ajout optionnel de l'email
            if (ownerEmail) {
                vcard += `EMAIL:${ownerEmail}\n`;
            }

            vcard += 'END:VCARD';

            // Envoi du contact
            await sock.sendMessage(key.remoteJid, {
                contacts: {
                    displayName: ownerName,
                    contacts: [{ vcard: vcard.trim() }]
                },
                caption: `👤 *Propriétaire du bot*\n\n` +
                         `Nom: ${ownerName}\n` +
                         `Numéro: ${ownerNumber}\n` +
                         `${ownerEmail ? `Email: ${ownerEmail}` : ''}`
            });

            // Réaction pour confirmation
            if (this.react) {
                await sock.sendMessage(key.remoteJid, {
                    react: {
                        text: this.react,
                        key: msg.key
                    }
                });
            }

        } catch (error) {
            console.error('Erreur dans la commande owner:', error);
            
            // Message d'erreur personnalisé
            let errorMessage = '❌ Impossible de récupérer les informations du propriétaire';
            if (error.message.includes('Configuration')) {
                errorMessage += '\n\nℹ️ Le propriétaire n\'a pas configuré ses informations';
            }

            await sock.sendMessage(key.remoteJid, {
                text: errorMessage,
                quoted: msg
            });
        }
    }
};