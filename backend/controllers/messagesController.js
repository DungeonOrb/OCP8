const {
    createOrGetConversation,
    listConversationsForUser,
    listMessagesForConversation,
    sendMessage,
} = require('../services/messagesService');

function statusFromError(e) {
    return e.status || 500;
}

async function createConversation(req, res) {
    const db = req.app.locals.db;

    try {
        const conversation = await createOrGetConversation(
            db,
            req.user.id,
            req.body || {}
        );

        res.status(201).json(conversation);
    } catch (e) {
        res.status(statusFromError(e)).json({ error: e.message });
    }
}

async function listConversations(req, res) {
    const db = req.app.locals.db;

    try {
        const conversations = await listConversationsForUser(db, req.user.id);
        res.json(conversations);
    } catch (e) {
        res.status(statusFromError(e)).json({ error: e.message });
    }
}

async function listMessages(req, res) {
    const db = req.app.locals.db;

    try {
        const messages = await listMessagesForConversation(
            db,
            req.params.id,
            req.user.id
        );

        res.json(messages);
    } catch (e) {
        res.status(statusFromError(e)).json({ error: e.message });
    }
}

async function createMessage(req, res) {
    const db = req.app.locals.db;

    try {
        const message = await sendMessage(
            db,
            req.params.id,
            req.user.id,
            req.body || {}
        );

        res.status(201).json(message);
    } catch (e) {
        res.status(statusFromError(e)).json({ error: e.message });
    }
}

module.exports = {
    createConversation,
    listConversations,
    listMessages,
    createMessage,
};