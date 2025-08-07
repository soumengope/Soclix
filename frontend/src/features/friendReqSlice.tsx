import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface FriendReq {
    _id : string,
    senderId : string,
    senderName : string,
    senderImage : string,
    receiverId : string,
    receiverName : string,
    status : string
}

const initialState:{friendReq:FriendReq[]} = {friendReq : []}

const friendReqSlice = createSlice({
    name :'friendReq',
    initialState,
    reducers:{
        setFriendReq : (state, action:PayloadAction<FriendReq[]>)=>{
            state.friendReq = action.payload
        },
        addFriendReq : (state, action:PayloadAction<FriendReq>)=>{
            state.friendReq.push(action.payload)
        }
    }
})
export const {setFriendReq, addFriendReq} = friendReqSlice.actions;
export default friendReqSlice.reducer;