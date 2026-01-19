import axios from "axios";
import { useEffect, useState } from "react";
import type { User } from "../features/userSlice";
import { useSelector } from "react-redux";
import type { RootState } from "../features/store";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "../features/store";
import { addFriendReq } from "../features/friendReqSlice";
import Spinner from "../components/Spinner";
import AcceptRequest from "./AcceptRequest";
import './sentrequest.css';

function SentRequest() {
    const me = useSelector((state:RootState)=>state.user.user);
    
    const friendLists:string[] = [];
    me?.friends?.map(elem => friendLists.push(elem.friendId.toString()));    

    const allFriendReq = useSelector((state:RootState) => state.friendReq.friendReq);

    const dispatch = useDispatch<AppDispatch>(); 

    const [users, setUsers] = useState<User[]>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(()=>{
        if (!me) return;
        const apiCall = async()=>{
            try{
                const response = await axios.get<User[]>('http://localhost:8080/allUsers');
                if(response.data){
                    const newUsers = response.data?.filter(elem=> elem.googleId !== me?.googleId);
                    const nextUsers = newUsers?.filter(elem=> !allFriendReq.some(req=> 
                        req.senderId === elem._id && req.receiverId === me?._id));
                    const finalUsers = nextUsers?.filter(elem => !friendLists.includes(elem._id.toString()));
                    setUsers(finalUsers);
                }
            }catch(err){
                console.log(err);
            }finally{
                setLoading(false);
            }
        }   
        apiCall()
    },[me, allFriendReq])

    console.log(users);
    

    const sendtoBackend = async(user:User)=>{
        if(!me) return;
        try{
            const res = await axios.post('http://localhost:8080/addFriend',
                {   senderId:me?._id,
                    senderName:me?.username,
                    senderImage:me?.image,
                    receiverId:user?._id,
                    receiverName:user?.username,
                })
                dispatch(addFriendReq(res.data))
        }catch(err){
            console.log(err);
        }
    }

     if (!me || loading) {
        return (
            <Spinner />
        );
    }
    
    return (
        <>
         <AcceptRequest/>

        <h2 className="friendreq_head">Add Friend Requests</h2>
        <section className="friendRequest_main">
            {
                users?.map((elem)=> {
                    const alreadySent = allFriendReq?.some((req)=> req.senderId === me?._id && req.receiverId === elem._id);
                    return(
                        <div key={elem._id as React.Key} className="user_lists">
                            {elem?.image && (
                            <img src={elem.image} className="user_img" referrerPolicy="no-referrer" alt={`${elem.username} image`}/>
                            )}
                            <div className="users_request">
                                <p>{elem.username}</p>
                                <button onClick={()=>{sendtoBackend(elem)}} 
                                        disabled={alreadySent}
                                        className="request_btn"
                                >{alreadySent?'Request Sent ✔':'Add friend'}</button>
                            </div>
                        </div>
                    )
                })
            }
        </section>
        </>
    );
}

export default SentRequest;