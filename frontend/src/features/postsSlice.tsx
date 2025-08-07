import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Posts{
    _id : string,
    userName : string,
    userId : string,
    userImage : string,
    description : string,
    images : string[],
    likes :number,
    likedBy : string[],
    comments : string[],
  }
const initialState:{posts:Posts[]} = {posts:[]};

const postsSlice = createSlice({
    name:'posts',
    initialState,
    reducers:{
        setPosts:(state, action:PayloadAction<Posts[]>)=>{
            state.posts = action.payload;
        },
        addPosts:(state, action:PayloadAction<Posts>)=>{
            state.posts.push(action.payload);
        }
    }
})
export const {setPosts, addPosts} = postsSlice.actions;
export default postsSlice.reducer;