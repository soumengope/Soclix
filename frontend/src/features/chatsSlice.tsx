import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Chats{
    _id:string,
    senderId:string,
    senderName:string,
    senderImage:string,
    receiverId:string,
    receiverName:string,
    receiverImage:string,
    message:string,
    createdAt:number
}
const initialState:{chats:Chats[]} = {chats:[]}

const chatsSlice = createSlice({
    name:'chats',
    initialState,
    reducers:{
        setChats:(state,action:PayloadAction<Chats[]>)=>{
            state.chats = action.payload;
        },
        addChats:(state,action:PayloadAction<Chats>)=>{
            state.chats.push(action.payload)
        }
    }
})
export default chatsSlice.reducer;
export const {setChats, addChats} = chatsSlice.actions;
