const { chatSessionsRef, realTimeDb  } = require('../../config/firebaseConfig')
const admin = require('firebase-admin');

const createChatSession = async (userId) => {
    try {
        const chatSessionRef = chatSessionsRef.push();
        const chatSessionId = chatSessionRef.key;
        // const timestamp = Date.now();
        // const formattedDate = new Date(timestamp).toISOString();

        const chatSessionData = {
            created: admin.database.ServerValue.TIMESTAMP,
            participants: [userId]
        }

        await chatSessionsRef.once('value', snapshot => {
            if (!snapshot.exists()) {
                chatSessionsRef.set({});
            }
        });

        // await chatSessionRef.set(chatSessionData)
        await chatSessionsRef.child(chatSessionId).set(chatSessionData);

        console.log('New chat session created with ID:', chatSessionId);

        return chatSessionId;
    } catch (error) {
        console.error('Error creating chat session:', error);
        throw error;
    }
}


const chatSessionExists = async (chatSessionId) => {
    const sessionRef = realTimeDb.ref(`sessions/${chatSessionId}`);
    const snapshot = await sessionRef.once('value');
    return snapshot.exists();
};

const deleteSessionFromRT = async (chatSessionId) => {
    try {
        await chatSessionsRef.child(chatSessionId).remove();
        console.log('Chat session deleted from real-time database.');
    } catch (error) {
        console.error('Error deleting chat session from real-time database:', error);
        throw error
    }
}

module.exports = {
    createChatSession,
    chatSessionExists,
    deleteSessionFromRT
};