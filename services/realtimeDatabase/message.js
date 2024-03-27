const { chatSessionsRef  } = require('../../config/firebaseConfig')

const saveMessage = async (sessionId, message) => {
    try {
        console.log("message in saveMessage function:", message)
        console.log("sessionId in saveMessage function:", sessionId)
    
        const sessionRef = chatSessionsRef.child(sessionId);
        const chatSessionDataSnapshot = await sessionRef.once('value');
        const chatSessionData = chatSessionDataSnapshot.val();

        let messages = [];

        if (chatSessionData && chatSessionData.messages) {
            messages = chatSessionData.messages;
        }

        messages.push(message);

        await sessionRef.update({ messages });

        console.log('Message saved to Firebase chat session');
    } catch (error) {
        console.error('Error saving message to Firebase:', error);
        throw error; 
    }
};

module.exports = {
    saveMessage
};