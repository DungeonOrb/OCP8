function normalizePair(userA, userB) {
    const a = Number(userA);
    const b = Number(userB);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
        const err = new Error('valid user ids are required');
        err.status = 400;
        throw err;
    }

    if (a === b) {
        const err = new Error('cannot create a conversation with yourself');
        err.status = 400;
        throw err;
    }

    return a < b ? [a, b] : [b, a];
}

async function ensureUserExists(db, userId) {
    const user = await db.getAsync(
        'SELECT id, name, picture, role, email FROM users WHERE id = ?',
        [userId]
    );

    if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }

    return user;
}

async function ensureParticipant(db, conversationId, userId) {
    const conversation = await db.getAsync(
        `
    SELECT *
    FROM conversations
    WHERE id = ?
      AND (user_one_id = ? OR user_two_id = ?)
    `,
        [conversationId, userId, userId]
    );

    if (!conversation) {
        const err = new Error('Conversation not found');
        err.status = 404;
        throw err;
    }

    return conversation;
}

async function createOrGetConversation(db, currentUserId, { receiver_id, property_id = null }) {
    if (!receiver_id) {
        const err = new Error('receiver_id is required');
        err.status = 400;
        throw err;
    }

    await ensureUserExists(db, currentUserId);
    await ensureUserExists(db, receiver_id);

    const [userOneId, userTwoId] = normalizePair(currentUserId, receiver_id);
    const propertyKey = property_id || '';

    if (property_id) {
        const property = await db.getAsync(
            'SELECT id FROM properties WHERE id = ?',
            [property_id]
        );

        if (!property) {
            const err = new Error('Property not found');
            err.status = 404;
            throw err;
        }
    }

    await db.runAsync(
        `
    INSERT OR IGNORE INTO conversations(property_id, property_key, user_one_id, user_two_id)
    VALUES (?, ?, ?, ?)
    `,
        [property_id || null, propertyKey, userOneId, userTwoId]
    );

    const conversation = await db.getAsync(
        `
    SELECT *
    FROM conversations
    WHERE property_key = ?
      AND user_one_id = ?
      AND user_two_id = ?
    `,
        [propertyKey, userOneId, userTwoId]
    );

    return conversation;
}

async function listConversationsForUser(db, userId) {
    await ensureUserExists(db, userId);

    const rows = await db.allAsync(
        `
    SELECT
      c.id,
      c.property_id,
      c.created_at,
      c.updated_at,

      p.title AS property_title,

      other_user.id AS other_user_id,
      other_user.name AS other_user_name,
      other_user.picture AS other_user_picture,

      last_message.body AS last_message,
      last_message.created_at AS last_message_at,

      (
        SELECT COUNT(*)
        FROM messages unread
        WHERE unread.conversation_id = c.id
          AND unread.sender_id != ?
          AND unread.read_at IS NULL
      ) AS unread_count

    FROM conversations c

    LEFT JOIN properties p ON p.id = c.property_id

    JOIN users other_user
      ON other_user.id = CASE
        WHEN c.user_one_id = ? THEN c.user_two_id
        ELSE c.user_one_id
      END

    LEFT JOIN messages last_message
      ON last_message.id = (
        SELECT m.id
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC, m.id DESC
        LIMIT 1
      )

    WHERE c.user_one_id = ? OR c.user_two_id = ?

    ORDER BY
      COALESCE(last_message.created_at, c.updated_at) DESC,
      c.id DESC
    `,
        [userId, userId, userId, userId]
    );

    return rows.map((row) => ({
        id: row.id,
        property_id: row.property_id,
        property_title: row.property_title,
        created_at: row.created_at,
        updated_at: row.updated_at,
        other_user: {
            id: row.other_user_id,
            name: row.other_user_name,
            picture: row.other_user_picture,
        },
        last_message: row.last_message,
        last_message_at: row.last_message_at,
        unread_count: row.unread_count || 0,
    }));
}

async function listMessagesForConversation(db, conversationId, userId) {
    await ensureParticipant(db, conversationId, userId);

    await db.runAsync(
        `
    UPDATE messages
    SET read_at = CURRENT_TIMESTAMP
    WHERE conversation_id = ?
      AND sender_id != ?
      AND read_at IS NULL
    `,
        [conversationId, userId]
    );

    const rows = await db.allAsync(
        `
    SELECT
      m.id,
      m.conversation_id,
      m.sender_id,
      m.body,
      m.created_at,
      m.read_at,
      u.name AS sender_name,
      u.picture AS sender_picture
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC, m.id ASC
    `,
        [conversationId]
    );

    return rows.map((row) => ({
        id: row.id,
        conversation_id: row.conversation_id,
        sender_id: row.sender_id,
        body: row.body,
        created_at: row.created_at,
        read_at: row.read_at,
        sender: {
            id: row.sender_id,
            name: row.sender_name,
            picture: row.sender_picture,
        },
    }));
}

async function sendMessage(db, conversationId, userId, { body }) {
    await ensureParticipant(db, conversationId, userId);

    const text = String(body || '').trim();

    if (!text) {
        const err = new Error('message body is required');
        err.status = 400;
        throw err;
    }

    const result = await db.runAsync(
        `
    INSERT INTO messages(conversation_id, sender_id, body)
    VALUES (?, ?, ?)
    `,
        [conversationId, userId, text]
    );

    await db.runAsync(
        `
    UPDATE conversations
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
        [conversationId]
    );

    const message = await db.getAsync(
        `
    SELECT
      m.id,
      m.conversation_id,
      m.sender_id,
      m.body,
      m.created_at,
      m.read_at,
      u.name AS sender_name,
      u.picture AS sender_picture
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.id = ?
    `,
        [result.lastID]
    );

    return {
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        body: message.body,
        created_at: message.created_at,
        read_at: message.read_at,
        sender: {
            id: message.sender_id,
            name: message.sender_name,
            picture: message.sender_picture,
        },
    };
}

module.exports = {
    createOrGetConversation,
    listConversationsForUser,
    listMessagesForConversation,
    sendMessage,
};