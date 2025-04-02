import { call, put, takeLatest } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';

// Действия для саги
export const initAudio = createAction('audio/init');
export const toggleAudio = createAction<boolean>('audio/toggle');
export const playWinSoundAction = createAction('audio/playWin', () => ({
  payload: undefined
}));
export const playLoseSoundAction = createAction('audio/playLose', () => ({
  payload: undefined
}));

// Создаем AudioContext и осциллятор
let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;

// Функция инициализации аудио
export function* initAudioSaga() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = 0.1;
    }
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
}

// Функция управления аудио
export function* handleToggleAudio(action: ReturnType<typeof toggleAudio>) {
  try {
    if (!audioContext || !gainNode) {
      yield call(initAudioSaga);
    }

    if (action.payload) { // Включаем звук
      if (audioContext?.state === 'suspended') {
        yield call([audioContext, audioContext.resume]);
      }

      if (oscillator) {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (e) {
          console.log('Oscillator already stopped');
        }
      }

      oscillator = audioContext!.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext!.currentTime);
      oscillator.connect(gainNode!);
      oscillator.start();
    } else { // Выключаем звук
      if (oscillator) {
        try {
          oscillator.stop();
          oscillator.disconnect();
          oscillator = null;
        } catch (e) {
          console.log('Oscillator already stopped');
        }
      }
    }
  } catch (error) {
    console.error('Error toggling audio:', error);
  }
}

export const playWinSound = async () => {
  if (!audioContext) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);

    // Победная мелодия
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.4);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.6);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  } catch (error) {
    console.error('Ошибка при воспроизведении звука победы:', error);
  }
};

export const playLoseSound = async () => {
  if (!audioContext) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sawtooth';
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8);

    // Звук проигрыша
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(220, audioContext.currentTime + 0.8);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.8);
  } catch (error) {
    console.error('Ошибка при воспроизведении звука проигрыша:', error);
  }
};

// Корневая сага для аудио
export function* audioSaga() {
  yield takeLatest(initAudio.type, initAudioSaga);
  yield takeLatest(toggleAudio.type, handleToggleAudio);
  yield takeLatest(playWinSoundAction.type, playWinSound);
  yield takeLatest(playLoseSoundAction.type, playLoseSound);
}

