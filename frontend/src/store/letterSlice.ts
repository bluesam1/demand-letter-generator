import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Letter {
  id: string;
  clientName: string;
  defendantName: string;
  status: string;
  createdAt: string;
}

interface LetterState {
  letters: Letter[];
  currentLetter: Letter | null;
  loading: boolean;
}

const initialState: LetterState = {
  letters: [],
  currentLetter: null,
  loading: false,
};

const letterSlice = createSlice({
  name: 'letter',
  initialState,
  reducers: {
    setLetters: (state, action: PayloadAction<Letter[]>) => {
      state.letters = action.payload;
    },
    setCurrentLetter: (state, action: PayloadAction<Letter | null>) => {
      state.currentLetter = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setLetters, setCurrentLetter, setLoading } = letterSlice.actions;
export default letterSlice.reducer;
