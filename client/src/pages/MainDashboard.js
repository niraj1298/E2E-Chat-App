import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';
import './MainDashboard.css';


const MainDashboard = ({ username }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [otherUsername, setOtherUsername] = useState('');

  const socketRef = useRef();

  const secretKey = 'your-secret-key';
  const encryptMessage = (message) => {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
  };
  
  const decryptMessage = (encryptedMessage) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };
  


  useEffect(() => {
    socketRef.current = io.connect('http://localhost:5000');

    // Emit login event with the logged-in user's username
    socketRef.current.emit('login', username);

    socketRef.current.on('receive message', (message) => {
      console.log('Message received:', message);
      const decryptedMessage = decryptMessage(message.text);
      console.log('Decrypted message:', decryptedMessage);
      setMessages((oldMessages) => [...oldMessages, { ...message, text: decryptedMessage }]);
    }
    );

    return () => {
      socketRef.current.disconnect();
    };
  }, [username]);

  const startChat = () => {
    console.log('Start chat with:', otherUsername);
    socketRef.current.emit('request chat', otherUsername);
    setMessages([]); // Clear the messages state
    setOtherUsername('');
  };
  


const sendMessage = () => {
  if (message.trim()) {
    console.log('Sending message:', message);
    const encryptedMessage = encryptMessage(message);
    socketRef.current.emit('send message', encryptedMessage);
    setMessage('');
  }
};
  

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    console.log('Socket connection:', socketRef.current);
  }, []);

  useEffect(() => {
    console.log('Messages:', messages);
  }, [messages]);

  return (
    <div className="dashboard">
      <div className="chat-controls">
        <input
          type="text"
          className="input other-user-input"
          value={otherUsername}
          onChange={(e) => setOtherUsername(e.target.value)}
          placeholder="Enter username to chat with..."
        />
        <button className="start-chat-button" onClick={startChat}>
          Start Chat
        </button>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.fromUsername === username ? 'my-message' : 'other-message'
            }`}
          >
            <div className="message-content">
              {msg.fromUsername === username ? 'You: ' : `${msg.fromUsername}: `}
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          className="input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="send-button" onClick={sendMessage}>
          <i className="material-icons">send</i>
        </button>
      </div>
    </div>
  );
};

export default MainDashboard;