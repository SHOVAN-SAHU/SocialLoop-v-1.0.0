import { createSlice } from "@reduxjs/toolkit";

const createPostSlice = createSlice({
  name: "createPost",
  initialState: {
    isOpen: false,
  },
  reducers: {
    setCreatePost: (state, action) => {
      state.isOpen = action.payload;
    },
  },
});

export const { setCreatePost } = createPostSlice.actions;
export default createPostSlice.reducer;
