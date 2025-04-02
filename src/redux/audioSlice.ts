import { createSlice } from '@reduxjs/toolkit';

interface AudioState {
  isPlaying: boolean;
}

const initialState: AudioState = {
  isPlaying: false
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    playWinSound: (state) => {
      state.isPlaying = true;
    },
    playLoseSound: (state) => {
      state.isPlaying = true;
    },
    stopSound: (state) => {
      state.isPlaying = false;
    }
  }
});

export const { playWinSound, playLoseSound, stopSound } = audioSlice.actions;
export default audioSlice.reducer; 