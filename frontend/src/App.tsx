import { Routes, Route } from "react-router-dom";
import Home from './Pages/Homepage';
import Errorpage from './Pages/Errorpage';
import SentRequest from "./Pages/SentRequest";
import AcceptRequest from './Pages/AcceptRequest';
import FriendLists from "./Pages/FriendLists";
import Chatroom from "./Pages/Chatroom";
import Navigation from "./Pages/Navigation";
import Stories from "./Pages/Stories";

import { useDispatch } from "react-redux";
import { addUser } from "./features/userSlice";
import type { AppDispatch } from "./features/store";
import { useEffect } from "react";
import axios from "axios";

import { setFriendReq } from "./features/friendReqSlice";
import { setPosts } from "./features/postsSlice";

function App() {

  const dispatch = useDispatch<AppDispatch>();

  useEffect(()=>{
    const fetchUser = async()=>{
      try{
        axios.defaults.withCredentials = true; 
        const res = await axios.get('http://localhost:8080/me');
        if(res.data){
          dispatch(addUser(res.data));
        } 
      }catch(err){
        console.log(err);
      }
    }
    fetchUser()
  },[dispatch])

  useEffect(()=>{
    const fetchFriendReq = async()=>{
      try{
        axios.defaults.withCredentials = true; 
        const res = await axios.get('http://localhost:8080/allFriendReq');
        if(res.data){
          dispatch(setFriendReq(res.data))
        } 
      }catch(err){
        console.log(err)
      }
    }
    fetchFriendReq()
  },[dispatch])

  useEffect(()=>{
    const fetchPosts = async()=>{
      try{
        axios.defaults.withCredentials = true; 
        const res = await axios.get('http://localhost:8080/getPosts');
        if(res.data){
          dispatch(setPosts(res.data))
          console.log(res.data);
        } 
      }catch(err){
        console.log(err)
      }
    }
    fetchPosts()
  },[dispatch])

  return (
    <>
      <Navigation />
      
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/sentReq' element={<SentRequest/>} />
        <Route path='/acceptReq' element={<AcceptRequest/>} />
        <Route path='/friends' element={<FriendLists/>} />
        <Route path='/chatroom' element={<Chatroom/>} />
        <Route path='/chatroom/:roomId' element={<Chatroom/>} />
        <Route path='/stories' element={<Stories/>} />
        <Route path='*' element={<Errorpage/>} />
      </Routes>
    </>
  )
}

export default App
