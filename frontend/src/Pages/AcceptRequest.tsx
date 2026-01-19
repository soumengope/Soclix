import { useSelector } from "react-redux";
import type { RootState } from "../features/store";
import type { FriendReq } from "../features/friendReqSlice";
import axios from "axios";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "../features/store";
import { addUser } from "../features/userSlice";

function AcceptRequest() {
    const dispatch = useDispatch<AppDispatch>();
    const allFriendReq = useSelector((state:RootState)=> state.friendReq.friendReq);
    const me = useSelector((state:RootState)=> state.user.user);
    let arrVal:string[] = [];
    me?.friends.map(elem => arrVal.push(elem.friendId));
    const onlyRequest = allFriendReq?.filter(elem=> elem.receiverId === me?._id && !arrVal.includes(elem.senderId.toString()));

    const sendAcceptReq = async(sender:FriendReq)=>{
        if(!me || !sender) return ;
        try{
            const res = await axios.post('http://localhost:8080/acceptRequest',{
                myId : me._id,
                myName : me.username,
                myImage : me.image,
                senderId : sender.senderId,
                senderName : sender.senderName,
                senderImage : sender.senderImage
            })

            if (res.status === 200){
                console.log('friend list added successfully');
                dispatch(addUser(res.data.meUpdate));
            }
        }catch(err){
            console.log(err);
        }
    }    
    console.log(onlyRequest);
    
    
    return (
        <div className="friendRequest_main" style={{padding: onlyRequest.length > 0 ? '10px' : '0px'}}>
            {
                onlyRequest?.map((elem)=>{
                    return(
                        <div key = {elem._id as React.Key} className="user_lists">
                            {elem?.senderImage && (
                            <img src={elem.senderImage?.toString()} 
                                 referrerPolicy="no-referrer" 
                                alt={`${elem.senderName} image`}
                                className="user_img"
                                />
                            )}
                            <div className="users_request">
                                <p>{elem.senderName}</p>
                                <button onClick={()=>{sendAcceptReq(elem)}}  className="request_btn">Accept</button>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    );
}

export default AcceptRequest;