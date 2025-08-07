import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useSelector } from "react-redux";
import type { RootState } from "../features/store";
import FriendLists from './FriendLists';
import "./chatroom.css"

const socket = io('http://localhost:8080');

type Message = {
  sender: string,
  senderName:string,
  message: string,
  timestamp: string,
};

function Chatroom() {
  const me = useSelector((state:RootState) => state.user.user);

  const { roomId } = useParams<{ roomId: string }>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendName, setFriendName] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    // Join room
    socket.emit('join-room', roomId);

    // Load room history from DB
    socket.on('room-history', (history: Message[]) => {
      setMessages(history);

      const friend = history.find(msg=> msg.senderName !== me?.username);
      if(friend){
        setFriendName(friend.senderName);
      }
    });

    // Receive new messages
    socket.on('receive-message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup on unmount
    return () => {
      socket.off('room-history');
      socket.off('receive-message');
    };
  }, [roomId]);

  const sendMessage = () => {
    if (message.trim() === '' || !roomId) return;

    socket.emit('send-message', {
      roomId,
      message,
      sender: socket.id,
      senderName:me?.username,
    });

    setMessage('');
  };
  
  useEffect(() => {
  if (chatBottomRef.current) {
    const container = chatBottomRef.current as HTMLDivElement;
    container.scrollTop = container.scrollHeight;
  }
}, [messages]);

  return (
    <section className='chatroom_mainSection'>
     <div className={roomId?'hide_friendLists':'show_friendLists'}>
       <FriendLists />
     </div>
      {
        roomId?
          <div className='chat_main'>
          <h2>Chtting with : {friendName}</h2>
          <div className='chat_container' ref={chatBottomRef}>
            {messages.map((msg, idx) => {
              const ifMe = msg.senderName === me?.username;
            return(
              <div key={idx} className={ifMe?'my_chat':'friend_chat'}>
                <p className='chat_msg'>{msg.message}</p>
                <div style={{ fontSize: '0.75rem', color: '#777' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
              </div>
            )
            })}
          </div>

          <div className='chatInp_main'>
            <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='chat_inp'
            />
            <button onClick={sendMessage} className='inp_btn'>
              Send
            </button>
          </div>
        </div>
        :<div className='empty_chatroom'></div>
      }
    </section>
  );
}

export default Chatroom;
