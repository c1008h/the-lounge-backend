const { Server } = require('socket.io');
const { createChatSession, deleteSessionFromRT, chatSessionExists } = require('../services/realtimeDatabase/chatSession');
const { addChatSessionToUser, deleteSessionFromUser, userHasChatSession } = require('../services/firestore/user')
const { addParticipant } = require('../services/realtimeDatabase/participants')
const { saveMessage } = require('../services/realtimeDatabase/message')
const { searchFriend, addFriend, acceptRequest, declineRequest, deleteFriend, cancelRequest } = require('../services/firestore/friend')
const { createUniqueId } = require('../utils/tempIdGenerator')
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin')

const APP_SECRET = process.env.APP_SECRET;
const ANON_TOKEN = process.env.ANON_TOKEN;

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.WEBSITE_URL,
            methods: ["GET", "POST"]
        }
    })

    async function findNumberOfClients(sessionId) {
        const clients = await io.in(sessionId).fetchSockets();
        const numClients = clients.length;
    
        return numClients
    }

    io.use(async (socket, next) => {
        console.log("Token received:", socket.handshake.auth.token);
        const token = socket.handshake.auth.token;

        if (token === ANON_TOKEN) {
            next();
        } else {
            try {
                const decodedToken = await admin.auth().verifyIdToken(token);

                socket.userId = decodedToken.uid; 
                console.log(`Authenticated user with ID: ${socket.userId}`);
                return next();
            } catch (error) {
                console.error('Authentication failed:', error.message);
                return next(new Error('Authentication error'));
            }
        }
    })

    io.on('connection', (socket) => {
        console.log('a user connected to server');

        socket.on('createAnonSession', async (sessionId) => {
            console.log("SOCKET ROOM:", socket.rooms);
            console.log(`SOCKET ID IS ${socket.id} WHEN SESSION ID: ${sessionId} IS CREATED IN THE SERVER`);
            socket.emit('anonSessionCreated', sessionId)
        })

        socket.on('addAnonToSession', async (user, sessionId, userId) => {
            console.log("SOCKET ROOM in addAnonToSession:", socket.rooms);
            console.log("SOCKET ID ON ADDING TO SESSION:", socket.id);

            socket.join(sessionId);
            const numClients = await findNumberOfClients(sessionId)
            console.log('amount of roomcount:', numClients)

            const msg = {
                message: `${user} joined`,
                type: 'notification',
                sender: 'system',
                timestamp: new Date()
            }
            
            io.in(sessionId).emit('anonAddedToSession',  user, sessionId, userId );
            io.in(sessionId).emit('receivedNotification', msg);
            io.in(sessionId).emit('roomOccupancyUpdate', numClients);
            
            // io.in(sessionId).emit('newUserNotification', userId, displayName)

            console.log(`User ${user} added to session ${sessionId} with user ID: ${userId}. Total room count: ${numClients}`);
        })

        socket.on('disconnectAnon', async (userId, displayName, sessionId) => {
            console.log('user id:', userId)
            console.log('session id:', sessionId)
            console.log(`Removed user ${userId} from session ${sessionId}`);
            const numClients = await findNumberOfClients(sessionId)

            const msg = {
                message: `${displayName} left`,
                type: 'notification',
                sender: 'system',
                timestamp: new Date()
            }

            io.in(sessionId).emit('anonRemoved', userId, displayName);
            io.in(sessionId).emit('roomOccupancyUpdate', numClients);
            io.in(sessionId).emit('receivedNotification', msg);

            socket.leave(sessionId);
        })

        socket.on('sendAnonMessage', async (sessionId, message) => {
            console.log("SOCKET ROOM in sendAnonMessage:", socket.rooms);
            console.log("SOCKET ID ON SENDING MESSAGE:", socket.id);

            // io.to(sessionId).emit('newAnonMessage', message);
            console.log('Message received:', message)
            console.log(`At sessionId : ${sessionId}`)
            // socket.to(sessionId).emit('receiveAnonMessage', message);
            io.to(sessionId).emit('receiveAnonMessage',  message );

        })

        socket.on('addSession', async (data) => {
            const chatSessionId = await createChatSession(data)
            await addChatSessionToUser(data, chatSessionId)

            socket.emit('sessionAdded', chatSessionId)
        })

        socket.on('deleteSession', async (sessionId, userId) => {
            console.log("Session ID", sessionId)
            console.log("user id:", userId)
            await deleteSessionFromUser(sessionId, userId)
            await deleteSessionFromRT(sessionId)

            socket.emit('sessionDeleted', 'session deleted!')
        })

        socket.on('addParticipant', async (sessionId, participant) => {
            if (!participant || !sessionId) return

            console.log("Session ID:", sessionId)
            console.log("Participant:", participant)

            await addParticipant(sessionId, participant)

            socket.emit('participantAdded', participant)
        })

        socket.on('sendMessage', async (sessionId, message) => {
            if (!sessionId || !message) return

            console.log("Session ID", sessionId)
            console.log("Message:", message)
            
            await saveMessage(sessionId, message)

            socket.emit('sentMessage', "message saved!")
        })

        socket.on('searchFriend', async (friendId) => {
            console.log( friendId )
            const friendFound = await searchFriend(friendId)

            socket.emit('friendFound', friendFound)
        })

        socket.on('addFriend', async (userId, friend) => {
            console.log(friend)
            console.log('userId:', userId)

            const result = await addFriend(userId, friend)
            console.log("successfully added:", result)
            socket.emit('friendAdded', result)
        })

        socket.on('deleteFriend', async (userId, friend) => {
            const result = await deleteFriend(userId, friend)
            console.log("successfully deleted:", result)
            socket.emit('friendDeleted', result)
        })

        socket.on('acceptFriendRequest', async (userId, friendId) => {
            const result = await acceptRequest(userId, friendId)
            socket.emit('acceptedFriendRequest', result)
        })

        socket.on('declineFriendRequest', async (userId, friend) => {
            const result = await declineRequest(userId, friend)
            socket.emit('friendRemoved', result)
        })

        socket.on('cancelFriendRequest', async (userId, friend) => {
            const result = await cancelRequest(userId, friend)
            console.log("successfully deleted:", result)
            socket.emit('canceledFriendRequest', result)
        })

        socket.on('joinRoom', async ({ userId, roomId }) => {
            try {
                socket.join(roomId)
                const chatSessionExist = await chatSessionExists(roomId);
                const userAuthorized = await userHasChatSession(userId, roomId);
    
                if (chatSessionExist && userAuthorized) {
                    socket.join(roomId);                
                    socket.emit('joinedChat', { roomId });
                    
                    // Optionally, load and emit previous messages from this chat session
                    // const messages = await loadMessagesForSession(roomId);
                    socket.emit('previousMessages', messages);
                } else {
                    socket.emit('errorJoiningChat', { message: 'Unable to join chat.' });
                }
            } catch (error) {
                console.error('Error joining chat session:', error);
                socket.emit('errorJoiningChat', { message: error.message || 'Unable to join chat.' });
            }
        })

        socket.on('leaveRoom', ({ userId, roomId }) => {
            socket.leave(roomId)
            console.log(`User ${userId} left room ${roomId}`);
        })

        socket.on('disconnect', ({ sessionId }) => {
            console.log('user disconnected')
            socket.leave(sessionId)
        })
    });
    
    io.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
    });
}

module.exports = setupSocket;
