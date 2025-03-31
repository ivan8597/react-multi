export type SceneState = {
  isRotating: boolean;
  isAudioPlaying: boolean;
  audioLoaded: boolean;
  cubeColor: number;    // Цвет куба в формате 0xRRGGBB
  cubeScale: number;    // Масштаб куба (1 - нормальный размер)
  rotationSpeed: number; // Скорость вращения куба
}