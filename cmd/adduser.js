// 
module.exports = {
    name: 'adduser',
    description: 'tag invisible',
    execute: async (sock, msg) => {
        const { key } = msg;
        await sock.sendMessage(key.remoteJid, { text: 'add est indisponible pour l\'instant *Menma* travaille dessus' });
    }
};