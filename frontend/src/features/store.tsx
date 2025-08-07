import {configureStore} from '@reduxjs/toolkit';
import usersSlice from './userSlice';
import chatsSlice from './chatsSlice';
import friendReqSlice from './friendReqSlice';
import postsSlice from './postsSlice';

const store = configureStore({
    reducer:{
        user : usersSlice,
        chats : chatsSlice,
        friendReq : friendReqSlice,
        posts : postsSlice
    }
})

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;