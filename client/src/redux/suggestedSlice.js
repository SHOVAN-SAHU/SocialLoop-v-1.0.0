import { createSlice } from "@reduxjs/toolkit";

const suggestedSlice = createSlice({
  name: "suggested",
  initialState: {
    users: [],
    profileRendering: false,
  },
  reducers: {
    setSuggestedUsers: (state, action) => {
      state.users = action.payload;
    },
    setProfileRendering: (state, action) => {
      state.profileRendering = action.payload;
    },
  },
});

export const { setSuggestedUsers, setProfileRendering } =
  suggestedSlice.actions;
export default suggestedSlice.reducer;
