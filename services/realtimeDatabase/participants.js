const { chatSessionsRef  } = require('../../config/firebaseConfig')

const addParticipant = async (sessionId, participant) => {
    try {
        if (!sessionId || !participant) throw error ("empty session id or empty participant")
        
        const chatSessionDataSnapshot = await chatSessionsRef.child(sessionId).once('value');
        const chatSessionData = chatSessionDataSnapshot.val();

        let participants = [];

        if (chatSessionData && chatSessionData.participants) {
            participants = chatSessionData.participants
        }
        
        participants.push(participant)

        await chatSessionsRef.child(sessionId).update({ participants });

        console.log('Participant added to chat session:', participant);

    } catch (error) {
        console.error('Error adding participant to session:', error);
        throw error;
    }
}

module.exports = {
    addParticipant
};