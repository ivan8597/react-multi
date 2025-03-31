/**
 *Slice Redux для управления состоянием 3D сцены
 * 
 * Данный модуль содержит Redux slice для управления состоянием сцены,
 * включая контроль вращения объектов и управление аудио.
 * 
 */

// Импорт необходимых функций из Redux Toolkit и пользовательских типов
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ObjectType = 'cube' | 'sphere' | 'torus' | 'pyramid' | 'cylinder';
export type TextureType = 'none' | 'wood' | 'metal' | 'brick' | 'custom';

export interface SceneState {
  cubeColor: number;
  objectType: ObjectType;
  textureType: TextureType;
  customTextureUrl: string | null;
  score: number;
  highScore: number;
  level: number;
  maxLevel: number;
}

const initialState: SceneState = {
  cubeColor: 0xffff00,
  objectType: 'cube',
  textureType: 'none',
  customTextureUrl: null,
  score: 0,
  highScore: 0,
  level: 1,
  maxLevel: 3
};

// Создание slice для управления состоянием сцены
const sceneSlice = createSlice({
  name: 'scene', // Уникальное имя slice
  initialState,  // Начальное состояние
  reducers: {
    setCubeColor: (state, action: PayloadAction<number>) => {
      state.cubeColor = action.payload;
    },
    randomizeCubeColor: (state) => {
      state.cubeColor = Math.floor(Math.random() * 0xffffff);
    },
    setObjectType: (state, action: PayloadAction<ObjectType>) => {
      state.objectType = action.payload;
    },
    setTextureType: (state, action: PayloadAction<TextureType>) => {
      state.textureType = action.payload;
    },
    setCustomTextureUrl: (state, action: PayloadAction<string | null>) => {
      state.customTextureUrl = action.payload;
      if (action.payload) {
        state.textureType = 'custom';
      }
    },
    setScore: (state, action: PayloadAction<number>) => {
      state.score = action.payload;
      if (state.score > state.highScore) {
        state.highScore = state.score;
      }
    },
    resetScore: (state) => {
      state.score = 0;
    },
    setLevel: (state, action: PayloadAction<number>) => {
      state.level = action.payload;
    },
    nextLevel: (state) => {
      state.level += 1;
    },
    resetLevel: (state) => {
      state.level = 1;
    }
  },
});

// Экспорт actions для использования в компонентах
export const {
  setCubeColor,
  randomizeCubeColor,
  setObjectType,
  setTextureType,
  setCustomTextureUrl,
  setScore,
  resetScore,
  setLevel,
  nextLevel,
  resetLevel
} = sceneSlice.actions;

// Экспорт reducer для конфигурации store
export default sceneSlice.reducer;