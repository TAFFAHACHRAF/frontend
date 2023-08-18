import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import '../../Chat.css';
import Header from '../../components/Header';
import config from '../../config';

function Chat() {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
  ];

  const userId = localStorage.getItem('user_id');

  const fetchMessages = async () => {
    try {
      const response = await fetch(config.apiURI +`/messages?userId=${userId}`);
      console.log(response)
      const messages = await response.json();
      
      const chatMessages = messages.filter(message => message.type === 'CHAT');
      chatMessages.sort((a, b) => new Date(b.localDateTime) - new Date(a.localDateTime));
      setMessages(chatMessages);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    const socket = new SockJS(config.apiURI +'/ws');
    const client = new Client({ webSocketFactory: () => socket });
  
    client.activate();
  
    client.onConnect = () => {
      setStompClient(client);
      client.subscribe('/topic/public', onMessageReceived);
      onConnected();
    };
  
    client.onStompError = (error) => {
      console.log('STOMP Error:', error);
      onError();
    };
  
    // Fetch messages here
    fetchMessages();
  
  }, []);
  

  const onConnected = () => {
    if (stompClient) {
      stompClient.subscribe('/topic/public', (payload) => {
        // Handle incoming message here
        const message = JSON.parse(payload.body);
        setMessages(prevMessages => [...prevMessages, message].sort((a, b) => new Date(b.localDateTime) - new Date(a.localDateTime)));
      });
  
      stompClient.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify({ sender: localStorage.getItem('penom'), type: 'JOIN' }),
      });
    }
  };
  


  const onError = () => {
    console.log('Could not connect to WebSocket server.');
  };

  const sendMessage = (event) => {
    event.preventDefault();

    const messageContent = messageInput.trim();
    if (messageContent && stompClient && stompClient.connected) {
        
      const chatMessage = {
        senderId: localStorage.getItem('user_id'),
        content: messageInput
      };
      stompClient.publish({
        destination: "/app/client.chat.sendMessage",
        body: JSON.stringify(chatMessage),
      });
      setMessageInput('');
    }
  };

  const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);
    setMessages(prevMessages => [...prevMessages, message].sort((a, b) => new Date(b.localDateTime) - new Date(a.localDateTime)));
  };

  const getAvatarColor = (messageSender) => {
    if (!messageSender) {
      return colors[0];
    }
  
    let hash = 0;
    for (let i = 0; i < messageSender.length; i++) {
      hash = 31 * hash + messageSender.charCodeAt(i);
    }
    const index = Math.abs(hash % colors.length);
  
    // Ensure index is within bounds
    if (index >= 0 && index < colors.length) {
      return colors[index];
    } else {
      return colors[0]; // Default color
    }
  };
  

  return (
    <>
    <nav className="bg-white py-4 px-8 flex justify-end mr-14 mt-8">
      <Header />
    </nav>
    <div className="App">
      {
        <div id="chat-page">
          <div className="chat-container flex-grow bg-gray-100 pr-2 pl-2 rounded">
            <div className="chat-header">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">
                    {localStorage.getItem('prenom')[0]}
                  </span>
                </div>
                <span className="ml-3 text-xl font-semibold">
                  {localStorage.getItem('prenom')} {localStorage.getItem('nom')}
                </span>
              </div>
            </div>
            <ul id="messageArea">
              {messages && messages.map((message, index) => (
                <li key={index} className={message.type === 'JOIN' || message.type === 'LEAVE' ? 'event-message' : 'chat-message'}>
                  {message.type === 'JOIN' && `${message.sender} joined!`}
                  {message.type === 'LEAVE' && `${message.sender} left!`}
                  {message.type === 'CHAT' && (
                    <div>
                      <i
                        style={{
                          backgroundColor: getAvatarColor(message.sender)
                        }}
                      >
                        {localStorage.getItem('prenom')[0]}
                      </i>
                      <span>{localStorage.getItem('prenom')}</span>
                      <p>{message.content}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <form id="messageForm" name="messageForm" onSubmit={sendMessage}>
              <div className="form-group">
                <div className="input-group clearfix">
                  <input
                    type="text"
                    id="message"
                    placeholder="Type a message..."
                    autoComplete="off"
                    className="form-control"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                  />
                  <button type="submit" className="primary">Send</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
    </>
  );
}

export default Chat;
