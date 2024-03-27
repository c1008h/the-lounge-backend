const { anonSessionRef  } = require('../../config/firebaseConfig')
const { createUniqueId } = require('../../utils/tempIdGenerator')
const admin = require('firebase-admin');

const createSessionAnon = async () => {
    try {
        const userId = createUniqueId()

        const anonSession = anonSessionRef.push();
        const chatSessionId = anonSession.key;
        // const timestamp = Date.now();
        // const formattedDate = new Date(timestamp).toISOString();

        const chatSessionData = {
            created: admin.database.ServerValue.TIMESTAMP
            // participants: [userId]
        }

        await anonSessionRef.once('value', snapshot => {
            if (!snapshot.exists()) {
                anonSessionRef.set({});
            }
        });

        await anonSessionRef.child(chatSessionId).set(chatSessionData);

        console.log('New chat session created with ID:', chatSessionId);

        return chatSessionId;
    } catch (error) {
        console.error('Error creating chat session:', error);
        throw error;
    }
}

const addToAnonSession = async (displayName, sessionId) => {
    try {
        const userId = createUniqueId()
        console.log('display name:', displayName)
        console.log('session id:', sessionId)

        if (!sessionId || !displayName) throw error ("empty session id or empty participant")
        
        const chatSessionDataSnapshot = await anonSessionRef.child(sessionId).once('value');
        const chatSessionData = chatSessionDataSnapshot.val();

        // let participants = [];

        // if (chatSessionData && chatSessionData.participants) {
        //     participants = chatSessionData.participants
        // }
        let participants = Array.isArray(chatSessionData?.participants) ? chatSessionData.participants : [];

        participants.push({ uid: userId, displayName: displayName })

        await anonSessionRef.child(sessionId).update({ participants });

        console.log(`Participant ${userId} added to anon chat session`);

        return userId
    } catch (error) {
        console.error('Error adding participant to session:', error);
        throw error;
    }
}

const saveAnonMessage = async (sessionId, msg) => {
    try {
        if (!msg || !sessionId) return

        console.log("message in saveMessage function:", msg)
        console.log("sessionId in saveMessage function:", sessionId)
    
        const anonRef = anonSessionRef.child(sessionId);
        const chatSessionDataSnapshot = await anonRef.once('value');
        const chatSessionData = chatSessionDataSnapshot.val();

        let messages = chatSessionData && chatSessionData.messages ? [...chatSessionData.messages] : [];

        messages.push({
            message: msg.message,
            sender: msg.sender,
            timestamp: admin.database.ServerValue.TIMESTAMP
        });

        console.log('messages after push:', messages)

        await anonRef.update({ messages });

        console.log('Message saved to Firebase chat session');
    } catch (error) {
        console.error('Error saving message to Firebase:', error);
        throw error; 
    }
}

const removeAnonFromSession = async (userId, sessionId) => {
    try {
        console.log("userId", userId)
        const sessionSnapshot = await anonSessionRef.child(sessionId).once('value');
        if (sessionSnapshot.exists()) {
            console.log('session does exist');

            const sessionData = sessionSnapshot.val();
            console.log('session data:', sessionData)

            let participants = sessionData.participants || [];
            participants = participants.filter(participant => participant.uid !== userId.uid);

            if (participants.length > 0) {
                await anonSessionRef.child(sessionId).child('participants').set(participants);
                console.log('remove participant')
            } else {
                await anonSessionRef.child(sessionId).remove();
                console.log('delete session forever')
            }
        } else {
            console.log('session not found')
        }
    } catch (error) {
        console.error('Error deleting chat session from real-time database:', error);
        throw error
    }
}

const deleteSession = async (sessionId) => {
    try {
        const sessionSnapshot = await anonSessionRef.child(sessionId).once('value');
        if (!sessionSnapshot.exists()) {
          console.log(`Session ${sessionId} does not exist, likely already deleted.`);
          return; 
        }
        
        await anonSessionRef.child(sessionId).remove();
       
    } catch (error) {
        if (error.message === "Session does not exist") {
            console.log(`Attempted to remove user from a non-existent session: ${sessionId}`);
        } else {
            throw error;
        }
    }
}

module.exports = {
    createSessionAnon,
    addToAnonSession,
    saveAnonMessage,
    removeAnonFromSession,
    deleteSession
};