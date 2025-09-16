import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import competitionsReducer from './competitionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    competitions: competitionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;