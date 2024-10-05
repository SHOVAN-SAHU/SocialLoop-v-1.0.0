import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import createPostSlice from "./createPostSlice";
import postSlice from "./postSlice";

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import suggestedSlice from "./suggestedSlice";
import socketSlice from "./socketSlice";
import chatSlice from "./chatSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  auth: authSlice,
  createPost: createPostSlice,
  post: postSlice,
  suggested: suggestedSlice,
  socketio: socketSlice,
  chat: chatSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
