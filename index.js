const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Configuration
const PREFIX = process.env.PREFIX || '!'
const OWNER_NUMBER = process.env.OWNER_NUMBER // Format: 123456789@s.whatsapp.net

// Stockage optimisé
const messageStore = new Map()

// Extraction du contenu des messages
function getMessageContent(message) {
    return (
        message?.conversation ||
        message?.extendedTextMessage?.text ||
        ''
    ).trim()
}

// Chargement des commandes avec alias
function loadCommands() {
    const commands = new Map()
    const aliases = new Map()
    const cmdPath = path.join(__dirname, 'cmd')

    if (!fs.existsSync(cmdPath)) {
        console.error('❌ Dossier "cmd" introuvable')
        return { commands, aliases }
    }

    fs.readdirSync(cmdPath)
        .filter(file => file.endsWith('.js') && !file.startsWith('_'))
        .forEach(file => {
            try {
                const command = require(`./cmd/${file}`)
                if (!command.name || typeof command.execute !== 'function') return

                // Ajout de la commande principale
                commands.set(command.name.toLowerCase(), command)
                console.log(`✅ ${PREFIX}${command.name.padEnd(15)} Chargée`)

                // Gestion des alias
                if (command.aliases?.length) {
                    command.aliases.forEach(alias => {
                        aliases.set(alias.toLowerCase(), command.name.toLowerCase())
                        console.log(`   ↳ Alias: ${PREFIX}${alias}`)
                    })
                }
            } catch (error) {
                console.error(`⚠️ Erreur de chargement [${file}]:`, error.message)
            }
        })

    return { commands, aliases }
}

// Initialisation du bot
async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth')
        const { version } = await fetchLatestBaileysVersion()
        const { commands, aliases } = loadCommands()

        const sock = makeWASocket({
            printQRInTerminal: true,
            auth: state,
            version,
            getMessage: key => messageStore.get(key.id)
        })

        // Gestion des événements
        sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
                console.log(shouldReconnect ? '🔄 Reconnexion...' : '🚫 Session expirée')
                if (shouldReconnect) setTimeout(startBot, 3000)
            } else if (connection === 'open') {
                console.log('✅ Connecté avec succès')
                // Envoi de notification à l'admin
                if (OWNER_NUMBER) {
                    sock.sendMessage(OWNER_NUMBER, { text: '🤖 Bot connecté' })
                        .catch(e => console.error('Notification admin:', e.message))
                }
            }
        })

        sock.ev.on('creds.update', saveCreds)

        sock.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0]
            if (!msg?.message) return

            const content = getMessageContent(msg.message)
            if (!content.startsWith(PREFIX)) return

            const [cmd, ...args] = content.slice(PREFIX.length).trim().split(/\s+/)
            const commandName = cmd.toLowerCase()
            const command = commands.get(commandName) || commands.get(aliases.get(commandName))

            if (!command) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: `⚠️ Commande inconnue\nUtilisez ${PREFIX}help pour l'aide`
                }, { quoted: msg })
            }

            try {
                console.log(`⚡ ${msg.key.remoteJid} > ${PREFIX}${command.name}`)
                await command.execute(sock, msg, args)
                messageStore.set(msg.key.id, msg) // Stockage du message
            } catch (error) {
                console.error(`❌ ${command.name}:`, error)
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Erreur lors de l\'exécution'
                }, { quoted: msg })
            }
        })

    } catch (error) {
        console.error('🚨 Erreur initialisation:', error.message)
        setTimeout(startBot, 5000)
    }
}

// Démarrer le bot
startBot()

// Gestion des erreurs globales
process.on('unhandledRejection', err => console.error('🚨 Rejet non géré:', err))
process.on('uncaughtException', err => console.error('💣 Exception non capturée:', err))