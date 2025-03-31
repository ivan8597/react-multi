/**
 * Конфигурация Redux store приложения
 * 
 * Данный модуль отвечает за создание и настройку главного Redux store,
 * включая подключение middleware для Redux-Saga и комбинирование редьюсеров.
 */

import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import sceneReducer from './sceneSlice';
import { audioSaga } from './audioSagas';

// Создаем middleware для саг
const sagaMiddleware = createSagaMiddleware();

/**
 * Конфигурация и создание главного Redux store
 * 
 *  reducer - Объект с редьюсерами приложения
 */
export const store = configureStore({
  reducer: {
    scene: sceneReducer, // Редьюсер для управления состоянием сцены
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});

// Запускаем саги
sagaMiddleware.run(audioSaga);

/**
 * Тип корневого состояния приложения
 * Автоматически выводится из типа возвращаемого значения store.getState
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Тип dispatch функции
 * Используется для типизации действий в приложении
 */
export type AppDispatch = typeof store.dispatch;

// Экспорт сконфигурированного store для использования в приложении
export default store;