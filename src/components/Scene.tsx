import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RootState } from '../redux/store';
import { 
  setCubeColor,
  TextureType,
  setObjectType,
  setScore,
  resetScore,
  nextLevel,
  resetLevel
} from '../redux/sceneSlice';
import styled, { keyframes } from 'styled-components';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Controls from './Controls';
import Instructions from './Instructions';
import LanguageSwitcher from './LanguageSwitcher';
import { playWinSoundAction, playLoseSoundAction } from '../redux/audioSagas';

const SceneContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    to bottom,
    #1e4d92 0%,
    #3a7bd5 30%,
    #67b6ff 70%,
    #87ceeb 100%
  );
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ErrorNotification = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #ff4444;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  animation: ${props => (props.$isClosing ? slideOut : slideIn)} 0.5s ease-in-out forwards;
  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    transform: translateY(-2px);
  }
`;

const CloseButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.3s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const StartButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  z-index: 1000;
  transition: background 0.3s ease;
  &:hover {
    background: #357abd;
  }
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

interface RestartButtonProps {
  $isWin: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

const RestartButton = styled.button<RestartButtonProps>`
  background: white;
  color: ${props => (props.$isWin ? '#28a745' : '#dc3545')};
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  &:active {
    transform: translateY(0);
  }
`;

const GameStatus = styled.div<{ $isWin: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => (props.$isWin ? '#28a745' : '#dc3545')};
  color: white;
  padding: 20px 40px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const ScoreDisplay = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 10px;
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 1000;
`;

const InstructionsButton = styled.button`
  position: fixed;
  top: 90px;
  right: 90px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
`;

const TEXTURE_PATHS = {
  wood: '/textures/wood.jpg',
  metal: '/textures/metal.jpg',
  brick: '/textures/brick.jpg'
} as const;

// Создание процедурных текстур
const createProceduralTexture = (type: TextureType): THREE.Texture | null => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return null;

  switch (type) {
    case 'wood': {
      const gradient = context.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, '#8B4513');
      gradient.addColorStop(0.2, '#A0522D');
      gradient.addColorStop(0.4, '#8B4513');
      gradient.addColorStop(0.6, '#A0522D');
      gradient.addColorStop(0.8, '#8B4513');
      gradient.addColorStop(1, '#A0522D');

      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 50; i++) {
        context.beginPath();
        context.strokeStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
        context.lineWidth = Math.random() * 2;
        const y = Math.random() * 512;
        context.moveTo(0, y);
        context.bezierCurveTo(
          170, y + Math.random() * 20 - 10,
          340, y + Math.random() * 20 - 10,
          512, y + Math.random() * 20 - 10
        );
        context.stroke();
      }
      break;
    }
    case 'metal': {
      context.fillStyle = '#808080';
      context.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = Math.random() * 20;
        
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
        gradient.addColorStop(1, 'rgba(128,128,128,0)');
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
      break;
    }
    case 'brick': {
      const brickHeight = 32;
      const brickWidth = 64;
      const mortarSize = 4;

      context.fillStyle = '#8B4513';
      context.fillRect(0, 0, 512, 512);

      for (let y = 0; y < 512; y += brickHeight + mortarSize) {
        const offset = (Math.floor(y / (brickHeight + mortarSize)) % 2) * (brickWidth / 2);
        for (let x = -offset; x < 512; x += brickWidth + mortarSize) {
          context.fillStyle = '#B22222';
          context.fillRect(x, y, brickWidth, brickHeight);
          
          context.fillStyle = 'rgba(0,0,0,0.1)';
          for (let i = 0; i < 10; i++) {
            context.fillRect(
              x + Math.random() * brickWidth,
              y + Math.random() * brickHeight,
              2,
              2
            );
          }
        }
      }
      break;
    }
    default:
      return null;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
};

// Функция для создания дерева
const createTree = (scene: THREE.Scene, position: THREE.Vector3): THREE.Group => {
  const tree = new THREE.Group();
  // Ствол
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(0, 0.5, 0);
  tree.add(trunk);
  // Крона
  const foliageGeometry = new THREE.ConeGeometry(0.8, 2, 16);
  const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.set(0, 2, 0);
  tree.add(foliage);
  tree.position.copy(position);
  tree.name = 'tree';
  scene.add(tree);
  return tree;
};

// Функция для создания финишной линии
const createFinishLine = (scene: THREE.Scene, position: THREE.Vector3): THREE.Mesh => {
  const geometry = new THREE.PlaneGeometry(10, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xFFD700, side: THREE.DoubleSide });
  const finishLine = new THREE.Mesh(geometry, material);
  finishLine.rotation.x = Math.PI / 2;
  finishLine.position.copy(position);
  finishLine.name = 'finishLine';
  scene.add(finishLine);
  return finishLine;
};

// Функция для создания пола
const createFloor = (scene: THREE.Scene) => {
  const floorGeometry = new THREE.PlaneGeometry(20, 100);
  const floorTexture = createProceduralTexture('wood');
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.8,
    metalness: 0.2,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.name = 'floor';
  scene.add(floor);
  return floor;
};

// Функция создания системы частиц
const createParticleSystem = (scene: THREE.Scene, position: THREE.Vector3) => {
  const particleCount = 100;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position.x + (Math.random() - 0.5) * 2;
    positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 2;
    positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;

    velocities[i * 3] = (Math.random() - 0.5) * 0.2;
    velocities[i * 3 + 1] = Math.random() * 0.2;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

    colors[i * 3] = 1;
    colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
    colors[i * 3 + 2] = 0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 1,
  });

  const particles = new THREE.Points(geometry, material);
  particles.name = 'particles';
  scene.add(particles);
  return particles;
};

// Добавляем конфигурацию уровней
const LEVEL_CONFIGS = {
  1: {
    treePositions: [
      new THREE.Vector3(-2, 0, -5),
      new THREE.Vector3(2, 0, -5),
      new THREE.Vector3(-1, 0, -10),
      new THREE.Vector3(1, 0, -10),
      new THREE.Vector3(-4, 0, -20),
      new THREE.Vector3(4, 0, -20),
      new THREE.Vector3(-2, 0, -25),
      new THREE.Vector3(2, 0, -25),
      new THREE.Vector3(0, 0, -30),
    ],
    finishLinePosition: new THREE.Vector3(0, 0, -40)
  },
  2: {
    treePositions: [
      new THREE.Vector3(-3, 0, -5),
      new THREE.Vector3(3, 0, -5),
      new THREE.Vector3(0, 0, -10),
      new THREE.Vector3(-2, 0, -15),
      new THREE.Vector3(2, 0, -15),
      new THREE.Vector3(-4, 0, -20),
      new THREE.Vector3(4, 0, -20),
      new THREE.Vector3(-3, 0, -25),
      new THREE.Vector3(3, 0, -25),
      new THREE.Vector3(-2, 0, -30),
      new THREE.Vector3(2, 0, -30),
      new THREE.Vector3(0, 0, -35),
    ],
    finishLinePosition: new THREE.Vector3(0, 0, -50)
  },
  3: {
    treePositions: [
      // Первая секция - зигзаг
      new THREE.Vector3(-3, 0, -5),
      new THREE.Vector3(3, 0, -10),
      new THREE.Vector3(-3, 0, -15),
      new THREE.Vector3(3, 0, -20),
      // Вторая секция - туннель
      new THREE.Vector3(-2, 0, -25),
      new THREE.Vector3(-2, 0, -30),
      new THREE.Vector3(2, 0, -25),
      new THREE.Vector3(2, 0, -30),
      // Третья секция - слалом
      new THREE.Vector3(0, 0, -35),
      new THREE.Vector3(-3, 0, -40),
      new THREE.Vector3(3, 0, -45),
      new THREE.Vector3(-3, 0, -50),
      new THREE.Vector3(3, 0, -55),
      // Финальное препятствие
      new THREE.Vector3(0, 0, -60),
    ],
    finishLinePosition: new THREE.Vector3(0, 0, -70)
  }
} as const;

const Scene = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    cubeColor,
    objectType,
    textureType,
    customTextureUrl,
    score,
    highScore,
    level
  } = useSelector((state: RootState) => state.scene);

  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [trees, setTrees] = useState<THREE.Group[]>([]);
  const [finishLine, setFinishLine] = useState<THREE.Mesh | null>(null);
  const [victoryRotation, setVictoryRotation] = useState(false);
  const [cameraRotation, setCameraRotation] = useState(true);
  const [particles, setParticles] = useState<THREE.Points | null>(null);
  const [isMovementStopped, setIsMovementStopped] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const sceneRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const scoreRef = useRef(0);
  const lastScoreUpdateRef = useRef(0);

  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer | null;
    cube: THREE.Mesh | null;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
  }>({
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    renderer: null,
    cube: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2()
  });

  const textureLoader = useRef(new THREE.TextureLoader());
  const texturesRef = useRef<Record<string, THREE.Texture>>({});
  const movementRef = useRef({ left: false, right: false });

  const loadTexture = useCallback((type: string, url?: string | null) => {
    if (type === 'none') return Promise.resolve(null);

    try {
      if (type === 'custom' && url) {
        return new Promise<THREE.Texture | null>((resolve) => {
          textureLoader.current.load(
            url,
            (texture) => {
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              texture.repeat.set(1, 1);
              texturesRef.current[url] = texture;
              resolve(texture);
            },
            undefined,
            () => resolve(null)
          );
        });
      }

      const proceduralTexture = createProceduralTexture(type as TextureType);
      return Promise.resolve(proceduralTexture);
    } catch (error) {
      console.error('Ошибка в loadTexture:', error);
      return Promise.resolve(null);
    }
  }, []);

  const handleResize = useCallback(() => {
    if (!threeRef.current.camera || !threeRef.current.renderer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    threeRef.current.camera.aspect = width / height;
    threeRef.current.camera.updateProjectionMatrix();
    threeRef.current.renderer.setSize(width, height);
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState !== 'playing' || isMovementStopped) return;
    if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') {
      movementRef.current.left = true;
    }
    if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') {
      movementRef.current.right = true;
    }
  }, [gameState, isMovementStopped]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') {
      movementRef.current.left = false;
    }
    if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') {
      movementRef.current.right = false;
    }
  }, []);

  const setupScene = useCallback(async () => {
    try {
      console.log('[setupScene] Starting scene setup');
      const { scene, camera, renderer } = threeRef.current;
      
      if (!renderer) {
        console.log('[setupScene] Renderer not initialized, skipping setup');
        return;
      }

      // Очищаем существующие объекты
      while(scene.children.length > 0) { 
        const object = scene.children[0];
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
        scene.remove(object);
      }

      // Создаем базовые объекты
      const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const material = new THREE.MeshBasicMaterial({ color: cubeColor });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(0, 1, 0);
      threeRef.current.cube = cube;
      scene.add(cube);

      // Добавляем базовый пол
      const floorGeometry = new THREE.PlaneGeometry(20, 100);
      const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.name = 'floor';
      scene.add(floor);

      // Создаем деревья
      const newTrees: THREE.Group[] = [];
      const currentLevelConfig = LEVEL_CONFIGS[level as keyof typeof LEVEL_CONFIGS];
      
      currentLevelConfig.treePositions.forEach(pos => {
        const tree = new THREE.Group();
        
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
        const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(0, 0.5, 0);
        tree.add(trunk);
        
        const foliageGeometry = new THREE.ConeGeometry(0.8, 2, 8);
        const foliageMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(0, 2, 0);
        tree.add(foliage);
        
        tree.position.copy(pos);
        tree.name = 'tree';
        scene.add(tree);
        newTrees.push(tree);
      });
      setTrees(newTrees);

      // Создаем финишную линию
      const finishGeometry = new THREE.PlaneGeometry(10, 1);
      const finishMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFD700,
        side: THREE.DoubleSide
      });
      const finish = new THREE.Mesh(finishGeometry, finishMaterial);
      finish.rotation.x = Math.PI / 2;
      finish.position.copy(currentLevelConfig.finishLinePosition);
      finish.name = 'finishLine';
      scene.add(finish);
      setFinishLine(finish);

      // Настраиваем камеру
      camera.position.set(0, 5, 5);
      camera.lookAt(0, 1, 0);

      // Настраиваем контроллеры
      if (!controlsRef.current && renderer.domElement) {
        controlsRef.current = new OrbitControls(camera, renderer.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05;
        controlsRef.current.screenSpacePanning = false;
        controlsRef.current.minDistance = 2;
        controlsRef.current.maxDistance = 20;
        controlsRef.current.target.set(0, 1, 0);
        controlsRef.current.enabled = false;
      }

      // Выполняем рендер
      try {
        renderer.render(scene, camera);
      } catch (renderError) {
        console.log('[setupScene] Initial render skipped:', renderError);
      }

      console.log('[setupScene] Setup completed successfully');
    } catch (error) {
      console.log('[setupScene] Setup error:', error);
      // Не устанавливаем ошибку в состояние, чтобы не показывать пользователю
    }
  }, [cubeColor, level]);

  const startGame = async () => {
    try {
      if (gameState !== 'idle') return;

      setGameState('playing');
      setIsMovementStopped(false);
      scoreRef.current = 0;
      lastScoreUpdateRef.current = Date.now();

      await setupScene();

      if (threeRef.current.cube) {
        threeRef.current.cube.position.set(0, 1, 0);
        threeRef.current.cube.rotation.set(0, 0, 0);
      }

      if (controlsRef.current) {
        controlsRef.current.enabled = false;
        controlsRef.current.reset();
      }

      if (threeRef.current.camera) {
        threeRef.current.camera.position.set(0, 5, 5);
        threeRef.current.camera.lookAt(0, 1, 0);
      }
    } catch (error) {
      console.log('[startGame] Error:', error);
      // Не показываем ошибку пользователю
      setGameState('idle');
    }
  };

  const restartGame = () => {
    setGameState('idle');
    setVictoryRotation(false);
    setCameraRotation(true);
    setIsMovementStopped(false);
    movementRef.current = { left: false, right: false };
    scoreRef.current = 0;
    lastScoreUpdateRef.current = Date.now();
    dispatch(resetScore());
    dispatch(resetLevel()); // Сброс уровня

    if (particles) {
      threeRef.current.scene.remove(particles);
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
      setParticles(null);
    }

    if (threeRef.current.cube) {
      threeRef.current.cube.position.set(0, 1, 0);
      threeRef.current.cube.rotation.set(0, 0, 0);
    }

    if (threeRef.current.camera) {
      threeRef.current.camera.position.set(0, 5, 5);
      threeRef.current.camera.lookAt(0, 1, 0);
    }

    setupScene().then(() => {
      if (threeRef.current.renderer && threeRef.current.scene && threeRef.current.camera) {
        threeRef.current.renderer.render(threeRef.current.scene, threeRef.current.camera);
      }
    }).catch(error => {
      console.error('Ошибка при перезапуске сцены:', error);
      setError(t('errors.animationError'));
    });
  };

  useEffect(() => {
    if (!sceneRef.current || threeRef.current.renderer) return;

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2', {
        alpha: true,
        antialias: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false
      });

      if (!context) {
        throw new Error(t('errors.webglNotSupported'));
      }

      const renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        antialias: true,
        alpha: true,
        powerPreference: 'default'
      });
      
      threeRef.current.renderer = renderer;
      threeRef.current.scene = new THREE.Scene();
      threeRef.current.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
      
    renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(window.devicePixelRatio);
      
      if (sceneRef.current.children.length > 0) {
        sceneRef.current.removeChild(sceneRef.current.children[0]);
      }
      sceneRef.current.appendChild(renderer.domElement);

      window.addEventListener('resize', handleResize);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      setupScene();

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        
        if (threeRef.current.cube) {
          if (threeRef.current.cube.geometry) threeRef.current.cube.geometry.dispose();
          if (threeRef.current.cube.material instanceof THREE.Material) {
            threeRef.current.cube.material.dispose();
          }
          threeRef.current.scene.remove(threeRef.current.cube);
        }
        
        threeRef.current.scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material instanceof THREE.Material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });

        renderer.dispose();
        renderer.forceContextLoss();
        threeRef.current = {
          ...threeRef.current,
          renderer: null,
          cube: null,
          scene: new THREE.Scene(),
          camera: new THREE.PerspectiveCamera()
        };

        if (controlsRef.current) {
          controlsRef.current.dispose();
          controlsRef.current = null;
        }
      };
    } catch (err) {
      console.error('Ошибка инициализации WebGL:', err);
      setError(err instanceof Error ? err.message : t('errors.initError'));
    }
  }, [setupScene, handleResize, handleKeyDown, handleKeyUp, t]);

  useEffect(() => {
    console.log('[animate Effect] Running. Deps changed. gameState:', gameState, 'isMovementStopped:', isMovementStopped);

    let isAnimating = true;
    let lastFrameTime = performance.now();

    const animate = async () => {
      if (!isAnimating) return;

      try {
        const { cube, renderer, scene, camera } = threeRef.current;
        
        if (!cube || !renderer || !scene || !camera) {
          console.warn('[animate] Waiting for objects initialization...');
          if (gameState === 'playing') {
            await setupScene();
            if (!threeRef.current.cube) {
              throw new Error('Failed to initialize scene objects');
            }
          }
          animationFrameRef.current = requestAnimationFrame(animate);
          return;
        }

        const currentTime = performance.now();
        const deltaTime = (currentTime - lastFrameTime) / 1000;
        lastFrameTime = currentTime;

        if (gameState === 'playing' && !isMovementStopped) {
          const cubeBox = new THREE.Box3().setFromObject(cube);

          // Проверка достижения финишной линии
          if (finishLine && cube.position.z <= finishLine.position.z) {
            // Проверяем, что куб находится в пределах финишной линии по X
            const finishWidth = 5; // Половина ширины финишной линии
            if (Math.abs(cube.position.x) <= finishWidth) {
              console.log('[Finish Line] Reached! Position:', {
                cubeZ: cube.position.z,
                finishZ: finishLine.position.z,
                cubeX: cube.position.x
              });
              handleGameEnd('won', cube, finishLine.position.z);
              return;
            }
          }

          // Проверка столкновений с деревьями
          for (const tree of trees) {
            const treeBox = new THREE.Box3().setFromObject(tree);
            if (cubeBox.intersectsBox(treeBox)) {
              handleGameEnd('lost');
              return;
            }
          }

          // Обновление очков только если игра активна и не достигнута финишная линия
          if (gameState === 'playing' && !isMovementStopped) {
            const now = Date.now();
            if (now - lastScoreUpdateRef.current >= 100) {
              const newScore = scoreRef.current + 1;
              console.log('[Score Update] Updating score:', {
                gameState,
                isMovementStopped,
                currentScore: newScore,
                lastUpdate: now
              });
              scoreRef.current = newScore;
              dispatch(setScore(newScore));
              lastScoreUpdateRef.current = now;
            }

            // Движение куба
            const moveSpeed = 5 * deltaTime;
            cube.position.z -= moveSpeed;
            
            if (movementRef.current.left) {
              cube.position.x = Math.max(-5, cube.position.x - moveSpeed);
            }
            if (movementRef.current.right) {
              cube.position.x = Math.min(5, cube.position.x + moveSpeed);
            }

            // Обновление позиции камеры для следования за кубом
            camera.position.set(
              cube.position.x,
              6,
              cube.position.z + 8
            );
            camera.lookAt(
              cube.position.x,
              1,
              cube.position.z - 2
            );
          }
        } else if (gameState === 'won' || gameState === 'lost') {
          if (victoryRotation) {
            cube.rotation.y += 2 * deltaTime;
            cube.rotation.x += 1.5 * deltaTime;
            cube.rotation.z += 1.5 * deltaTime;
          }

          if (gameState === 'won' && cameraRotation) {
            const time = currentTime * 0.001;
            const radius = 8;
            camera.position.x = Math.cos(time * 0.5) * radius;
            camera.position.z = Math.sin(time * 0.5) * radius + cube.position.z;
            camera.position.y = 5 + Math.sin(time) * 0.5;
            camera.lookAt(cube.position);
          }

          if (particles && gameState === 'won') {
            const positions = particles.geometry.attributes.position.array as Float32Array;
            const velocities = particles.geometry.attributes.velocity.array as Float32Array;
            const colors = particles.geometry.attributes.color.array as Float32Array;

            for (let i = 0; i < positions.length; i += 3) {
              positions[i] += velocities[i];
              positions[i + 1] += velocities[i + 1];
              positions[i + 2] += velocities[i + 2];
              velocities[i + 1] -= 0.001;
              colors[i + 1] *= 0.995;

              if (positions[i + 1] < 0) {
                positions[i + 1] = cube.position.y || 1;
                velocities[i + 1] = Math.random() * 0.2;
                colors[i + 1] = 0.8 + Math.random() * 0.2;
              }
            }

            particles.geometry.attributes.position.needsUpdate = true;
            particles.geometry.attributes.color.needsUpdate = true;
          }
        } else if (gameState === 'idle') {
          if (controlsRef.current) {
            if (!controlsRef.current.enabled) {
              controlsRef.current.enabled = true;  
            }
            controlsRef.current.update();
          }
      }

      renderer.render(scene, camera);
        animationFrameRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.error('[animate] Error:', error);
        setError(t('errors.animationError'));
        isAnimating = false;
      }
    };

    animate();

    return () => {
      isAnimating = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [gameState, isMovementStopped, setupScene, trees, finishLine, victoryRotation, cameraRotation, particles, dispatch, t]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('sceneSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      dispatch(setCubeColor(settings.cubeColor || 0xffff00));
      dispatch(setObjectType(settings.objectType || 'cube'));
      if (settings.highScore) {
        dispatch(setScore(settings.highScore));
        dispatch(resetScore());
      }
    }
  }, [dispatch]);

  useEffect(() => {
    const settings = {
      cubeColor,
      objectType,
      highScore
    };
    localStorage.setItem('sceneSettings', JSON.stringify(settings));
  }, [cubeColor, objectType, highScore]);

  useEffect(() => {
    if (error && !isClosing) {
      const timer = setTimeout(() => {
        setIsClosing(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, isClosing]);

  useEffect(() => {
    let effectTimer: NodeJS.Timeout | null = null;

    if (gameState === 'won') {
      setVictoryRotation(true);
      setCameraRotation(true);
      movementRef.current = { left: false, right: false };
      if (threeRef.current.cube && !particles) {
        const newParticles = createParticleSystem(
          threeRef.current.scene,
          threeRef.current.cube.position
        );
        setParticles(newParticles);
      }

      effectTimer = setTimeout(() => {
        setVictoryRotation(false);
        setCameraRotation(false);
        if (particles) {
          threeRef.current.scene.remove(particles);
          particles.geometry.dispose();
          (particles.material as THREE.Material).dispose();
          setParticles(null);
        }
      }, 5000);
    } else if (gameState === 'lost') {
      movementRef.current = { left: false, right: false };
      setVictoryRotation(false);
      setCameraRotation(false);
      if (particles) {
        threeRef.current.scene.remove(particles);
        particles.geometry.dispose();
        (particles.material as THREE.Material).dispose();
        setParticles(null);
      }
    } else {
      setVictoryRotation(false);
      setCameraRotation(true);
      if (particles) {
        threeRef.current.scene.remove(particles);
        particles.geometry.dispose();
        (particles.material as THREE.Material).dispose();
        setParticles(null);
      }
    }

    return () => {
      if (effectTimer) {
        clearTimeout(effectTimer);
      }
    };
  }, [gameState, particles]);

  const handleCloseNotification = () => {
    setIsClosing(true);
  };

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setError(null);
        setIsClosing(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isClosing]);

  useEffect(() => {
    if (!threeRef.current.renderer) return;

    const updateScene = async () => {
      try {
        if (threeRef.current.cube) {
          if (threeRef.current.cube.geometry) threeRef.current.cube.geometry.dispose();
          if (threeRef.current.cube.material instanceof THREE.Material) {
            threeRef.current.cube.material.dispose();
          }
          threeRef.current.scene.remove(threeRef.current.cube);
          threeRef.current.cube = null;
        }
        
        await setupScene();
        
        if (!threeRef.current.cube || !threeRef.current.renderer) {
          throw new Error('Не удалось создать объект или рендерер был уничтожен');
        }
        
        threeRef.current.renderer.render(threeRef.current.scene, threeRef.current.camera);
      } catch (error) {
        console.error('Ошибка при обновлении сцены:', error);
        setError(error instanceof Error ? error.message : 'Ошибка при обновлении сцены');
      }
    };

    updateScene();
  }, [objectType, textureType, customTextureUrl, setupScene]);

  useEffect(() => {
    return () => {
      Object.values(texturesRef.current).forEach(texture => texture.dispose());
      texturesRef.current = {};
    };
  }, []);

  const handleGameEnd = (result: 'won' | 'lost', cube?: THREE.Mesh, finishLineZ?: number) => {
    console.log('[handleGameEnd] Called with:', {
      result,
      currentScore: scoreRef.current,
      gameState,
      isMovementStopped,
      currentLevel: level
    });

    setIsMovementStopped(true);
    movementRef.current = { left: false, right: false };
    
    const finalScore = scoreRef.current;
    
    if (result === 'won') {
      if (level === 3) {
        // Если это последний уровень
        setGameState('won');
        dispatch(setScore(finalScore));
      } else {
        // Переход на следующий уровень
        dispatch(nextLevel());
        dispatch(setScore(finalScore));
        setGameState('idle');
        if (cube && finishLineZ !== undefined) {
          cube.position.set(0, 1, 0);
        }
        setupScene();
      }
      dispatch(playWinSoundAction());
    } else {
      setGameState('lost');
      dispatch(setScore(finalScore));
      dispatch(playLoseSoundAction());
    }
    
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
  };

  return (
    <SceneContainer>
      <CanvasContainer ref={sceneRef} style={{ cursor: 'pointer' }} />
      <StartButton onClick={startGame} disabled={gameState !== 'idle'}>
        {level === 1 ? t('scene.startButton') : t('scene.startLevel', { level })}
      </StartButton>
      <Controls />
      <LanguageSwitcher />
      <InstructionsButton onClick={() => setShowInstructions(true)}>
        <HelpOutlineIcon />
      </InstructionsButton>
      <Instructions 
        isVisible={showInstructions} 
        onClose={() => setShowInstructions(false)} 
      />
      <ScoreDisplay>
        <div>{t('scene.level', { level })}</div>
        <div>{t('scene.score', { score })}</div>
        <div>{t('scene.highScore', { score: highScore })}</div>
      </ScoreDisplay>
      {gameState === 'won' && (
        <GameStatus $isWin={true}>
          <span>{level === 3 ? t('scene.congrats') : t('scene.levelComplete')}</span>
          <div>{t('scene.score', { score })}</div>
          <RestartButton $isWin={true} onClick={restartGame}>
            {level === 3 ? t('scene.playAgain') : t('scene.nextLevel')}
          </RestartButton>
        </GameStatus>
      )}
      {gameState === 'lost' && (
        <GameStatus $isWin={false}>
          <span>{t('scene.gameOver')}</span>
          <div>{t('scene.finalScore', { score })}</div>
          <RestartButton $isWin={false} onClick={restartGame}>
            {t('scene.restart')}
          </RestartButton>
        </GameStatus>
      )}
      {error && (
        <ErrorNotification $isClosing={isClosing} onClick={handleCloseNotification}>
          <span>{error}</span>
          <CloseButton>
            <CloseIcon fontSize="small" />
          </CloseButton>
        </ErrorNotification>
      )}
    </SceneContainer>
  );
};

export default Scene;
