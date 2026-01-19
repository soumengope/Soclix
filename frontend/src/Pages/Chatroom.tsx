import { useEffect, useState, useRef} from 'react';
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
  image:string,
  timestamp: string,
};

function Chatroom() {
  const me = useSelector((state:RootState) => state.user.user);

  const { roomId } = useParams<{ roomId: string }>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendName, setFriendName] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [image, setImage]= useState<File | null>(null);

  const friends = me?.friends ?? [];

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

    // Cleanup on unmount
    return () => {
      socket.off('room-history');
    };
  }, [roomId]);

  // If user data is available (or when roomId changes) derive friend name from the friend list
  useEffect(() => {
    if (!roomId || !me) return;
    const friend = me.friends.find((f) => f.roomId === roomId);
    if (friend) setFriendName(friend.friendName);
  }, [roomId, me]);

  // Update receive-message handler to set friend name if it's not known yet
  useEffect(() => {
    const handler = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      if (!friendName && msg.senderName !== me?.username) {
        setFriendName(msg.senderName);
      }
    };

    socket.on('receive-message', handler);
    return () => {
      socket.off('receive-message', handler);
    };
  }, [friendName, me]);

  function fileToBase64(file:File):Promise<string>  {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // reads file as base64
        reader.onload = () => resolve(reader.result as string); // result is base64 string
        reader.onerror = (error) => reject(error);
      });
  }

  const sendMessage = async() => {
    if ((message.trim() === ''  &&  !image) || !roomId) return;
    let fileUrl = "";

    if (image) {
      fileUrl = await fileToBase64(image);
    }

    // Now send socket message with file URL (if any)
    socket.emit("send-message", {
      roomId,
      message,
      image:fileUrl,
      sender: socket.id,
      senderName: me?.username,
    });
    console.log(fileUrl);
    // Reset
    setMessage("");
    setImage(null);
  };
  
  useEffect(() => {
  if (chatBottomRef.current) {
    const container = chatBottomRef.current as HTMLDivElement;
    container.scrollTop = container.scrollHeight;
  }
}, [messages]);

const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file); // replace old image
    } else {
      setImage(null);
    }
    e.target.value = "";
};

  // If user has no friends, show message and hide chatroom
  if (friends.length === 0) {
    return (
      <section className='noFriend_section'>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>You don't have any friends yet</h2>
          <p>Add some friends to start chatting.</p>
        </div>
      </section>
    );
  }

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
                <div className='chat_msg'>
                   {msg.message && <p className='msg_text'>{msg.message}</p>}
                    {msg.image && <img className='msg_image' src={msg.image} alt="image"/>}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#777' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
              </div>
            )
            })}
          </div>

          <div className='chatInp_main'>
            <div className='chatInp_imgMain'>
              <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='chat_inp'
              />
              <div className="custom-file">
                <input type="file" accept='image/*' id="fileUpload" onChange={handleImage} />
                <label htmlFor="fileUpload">
                  <img src="../upload.png"/>
                </label>
              </div>
            </div>
            <button onClick={sendMessage} className='inp_btn'>
              Send
            </button>
          </div>

          <div className='chatImg_preview'>
            {
              image? <img
              src={URL.createObjectURL(image)}
              alt='chat photo'
              className='chatImage_img'
              /> :''
            }
          </div>

        </div>
        :<div className='empty_chatroom'></div>
      }
    </section>
  );
}
export default Chatroom;