import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import letterReducer from './letterSlice';
import templatesReducer from './templatesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    letter: letterReducer,
    templates: templatesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
