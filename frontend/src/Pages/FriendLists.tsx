import { useSelector } from "react-redux";
import type { RootState } from "../features/store";
import { useNavigate } from "react-router-dom";
import "./chatroom.css";

function FriendLists() {
    const me = useSelector((state:RootState) => state.user.user);
    const navigate = useNavigate();
    return (
            <section className="friends_main">
            {
                me?.friends.map((elem)=>{
                    return(
                        <div key={elem.friendId} className="users_lists">
                            {elem?.friendImage && (
                            <img src={elem.friendImage?.toString()} 
                                className="users_img" 
                                referrerPolicy="no-referrer" 
                                alt={`${elem.friendName} image`}/>
                            )}
                            <p>{elem.friendName}</p>
                            <button 
                                className="req_btn"
                                onClick={()=> navigate(`/chatroom/${elem.roomId}`)}>Chat</button>
                        </div>
                    )
                })
            }
            </section>
    );
}

export default FriendLists;