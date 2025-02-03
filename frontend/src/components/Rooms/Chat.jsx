import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import '../../SCSS/chat.scss'
const Chat = ({ playerID, socket, group }) => {

    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const { roomId } = useParams(); // Fetch roomId from the URL

    // const [isAtBottom, setIsAtBottom] = useState(true);
    // const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);

    const chatContainerRef = useRef(null);
    // const messagesEndRef = useRef(null);
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

    

    useEffect(() => {
       
        const fetchMessages = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/rounds/get-message/${roomId}?group=${group}`, {
                    credentials: 'include', // Include JWT cookies
                });
                if (response.ok) {
                    const data = await response.json();
                   
                    setMessages(data.messages || []);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

    }, [roomId, group])

    const sendMessage = (e) => {
        e.preventDefault();
        if (currentMessage.trim() !== '') {
            const messageData = {
                roomId,
                sender: playerID,
                message: currentMessage,
                group: Number(group)
            };

            // Emit the message via Socket.IO
            socket.emit('sendMessage', { message: messageData });

            setCurrentMessage('');
        }
    };

    // Listen for new messages via Socket.IO
    useEffect(() => {
        socket.on('receiveMessage', (data) => {
            const msg = data.message;
            // Only add if msg.groupNumber matches our current group
            if (Number(msg.groupNumber) === Number(group)) {
                setMessages((prevMessages) => [...prevMessages, msg]);
            }
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, [socket, group]);


    return (
        <div className="chat-container">
            <div className="chat-messages" ref={chatContainerRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chat-message ${message.sender === playerID ? 'my-message' : 'other-message'
                            }`}
                    >
                        <div className="message-content">{message.message}</div>
                        <div className="message-info">
                            <span className="message-sender">{message.sender}</span>
                        </div>
                    </div>
                ))}
                {/* <div ref={messagesEndRef} /> */}
            </div>
            {/* {showNewMessageAlert && (
                <div className="new-message-alert" onClick={handleNewMessageClick}>
                    New message(s) added - Click to see
                </div>
            )} */}
            <form className="chat-input" onSubmit={sendMessage}>
                <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>

    )
}

export default Chat