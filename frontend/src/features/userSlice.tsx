import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Friend = {
  friendId : string,
  friendName : string,
  friendImage : string,
  roomId : string,
}

export interface User{
    _id:string,
    googleId:string,
    username:string,
    email:string,
    image:string,
    isGoogleVarfied:boolean,
    friends:Friend[],
    createdAt:number
}

const initialState: { user: User | null } = {user: null};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
    },
  },
});

export const { addUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;