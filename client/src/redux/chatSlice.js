import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    onlineUsers: [],
    messages: [],
    chatRendering: false,
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setChatRendering: (state, action) => {
      state.chatRendering = action.payload;
    },
  },
});

export const {
  setOnlineUsers,
  setMessages,
  setChatRendering,
  setUpcomingMessages,
} = chatSlice.actions;
export default chatSlice.reducer;
