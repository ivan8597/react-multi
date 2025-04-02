import React, { useRef, Component } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../redux/store';
import { 
  randomizeCubeColor, 
  setObjectType,
  ObjectType,
  TextureType,
  setTextureType,
  setCustomTextureUrl
} from '../redux/sceneSlice';
import styled from 'styled-components';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Cube from '@mui/icons-material/CropSquare';
import Sphere from '@mui/icons-material/Circle';
import Torus from '@mui/icons-material/AllInclusive';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import TextureIcon from '@mui/icons-material/Texture';

const ControlPanel = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const Button = styled.button`
  background: transparent;
  border: 2px solid #ffffff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 100px;
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  color: white;
  font-size: 11px;
  margin-bottom: 1px;
`;

const Slider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 3px;
  border-radius: 2px;
  background: #ffffff;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }

  &::-moz-range-thumb {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }
`;

const ShapeButton = styled(Button)<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ShapeControls = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
`;

const TextureControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TextureButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  background: ${props => props.$active ? '#4a90e2' : '#2c3e50'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  
  &:hover {
    background: #4a90e2;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { 
      hasError: false,
      errorMessage: ''
    };
  }

  static getDerivedStateFromError(error: unknown): { hasError: boolean; errorMessage: string } {
    let errorMessage = 'Произошла неизвестная ошибка';
    
    console.group('Детали ошибки:');
    console.error('Тип ошибки:', typeof error);
    console.error('Значение:', error);
    
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
      errorMessage = `Ошибка: ${error.message}\nStack: ${error.stack}`;
    } else if (error instanceof Event) {
      const eventDetails = {
        type: error.type,
        target: error.target,
        currentTarget: error.currentTarget,
        eventPhase: error.eventPhase,
        bubbles: error.bubbles,
        cancelable: error.cancelable,
        defaultPrevented: error.defaultPrevented,
        timeStamp: error.timeStamp,
      };
      console.error('Event details:', eventDetails);
      errorMessage = `Событие: ${error.type}\nДетали: ${JSON.stringify(eventDetails, null, 2)}`;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      try {
        const details = JSON.stringify(error, null, 2);
        console.error('Object details:', details);
        errorMessage = `Объект ошибки:\n${details}`;
      } catch (e) {
        errorMessage = 'Ошибка не может быть преобразована в строку';
      }
    }
    
    console.groupEnd();
    return { hasError: true, errorMessage };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.group('Ошибка в компоненте Controls');
    console.error('Ошибка:', error);
    console.error('Компонент:', errorInfo.componentStack);
    console.error('Дополнительная информация:', {
      timestamp: new Date().toISOString(),
      location: window.location.href,
      userAgent: navigator.userAgent
    });
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          padding: '20px',
          background: 'rgba(220, 53, 69, 0.95)',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
          maxWidth: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          zIndex: 1001,
          fontFamily: 'monospace'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>
            {window.i18n?.t('errors.errorOccurred') || 'Произошла ошибка'}
          </h3>
          <pre style={{ 
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: 'rgba(0,0,0,0.2)',
            padding: '10px',
            borderRadius: '5px'
          }}>
            {this.state.errorMessage}
          </pre>
          <button
            onClick={() => {
              console.log('Перезагрузка страницы...');
              window.location.reload();
            }}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              background: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {window.i18n?.t('errors.reloadPage') || 'Перезагрузить страницу'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const WrappedControls = () => {
  return (
    <ErrorBoundary>
      <Controls />
    </ErrorBoundary>
  );
};

const Controls = () => {
  const dispatch = useDispatch();
  const { 
    objectType,
    textureType
  } = useSelector((state: RootState) => state.scene);
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShapeChange = (shape: ObjectType) => {
    try {
      console.log('Изменение формы на:', shape);
      dispatch(setObjectType(shape));
    } catch (error) {
      console.error('Ошибка при изменении формы:', error);
    }
  };

  const handleTextureChange = (type: TextureType) => {
    try {
      dispatch(setTextureType(type));
    } catch (error) {
      console.error('Ошибка при изменении текстуры:', error);
    }
  };

  const handleFileSelect = () => {
    try {
      fileInputRef.current?.click();
    } catch (error) {
      console.error('Ошибка при выборе файла:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        dispatch(setCustomTextureUrl(url));
        dispatch(setTextureType('custom'));
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  return (
    <ControlPanel>
      <Button 
        onClick={() => dispatch(randomizeCubeColor())} 
        title={t('controls.randomColor')}
      >
        <ColorLensIcon />
      </Button>

      <ShapeControls>
        <ShapeButton 
          onClick={() => handleShapeChange('cube')}
          title={t('controls.cube')}
          $active={objectType === 'cube'}
        >
          <Cube />
        </ShapeButton>
        <ShapeButton 
          onClick={() => handleShapeChange('sphere')}
          title={t('controls.sphere')}
          $active={objectType === 'sphere'}
        >
          <Sphere />
        </ShapeButton>
        <ShapeButton 
          onClick={() => handleShapeChange('torus')}
          title={t('controls.torus')}
          $active={objectType === 'torus'}
        >
          <Torus />
        </ShapeButton>
        <ShapeButton 
          onClick={() => handleShapeChange('cylinder')}
          title={t('controls.cylinder')}
          $active={objectType === 'cylinder'}
        >
          <ViewColumnIcon />
        </ShapeButton>
      </ShapeControls>

      <TextureControls>
        <TextureButton 
          $active={textureType === 'none'}
          onClick={() => handleTextureChange('none')}
        >
          <TextureIcon /> {t('controls.noTexture')}
        </TextureButton>
        <TextureButton 
          $active={textureType === 'wood'}
          onClick={() => handleTextureChange('wood')}
        >
          <TextureIcon /> {t('controls.wood')}
        </TextureButton>
        <TextureButton 
          $active={textureType === 'metal'}
          onClick={() => handleTextureChange('metal')}
        >
          <TextureIcon /> {t('controls.metal')}
        </TextureButton>
        <TextureButton 
          $active={textureType === 'brick'}
          onClick={() => handleTextureChange('brick')}
        >
          <TextureIcon /> {t('controls.brick')}
        </TextureButton>
        <TextureButton onClick={handleFileSelect}>
          <TextureIcon /> {t('controls.uploadTexture')}
        </TextureButton>
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </TextureControls>
    </ControlPanel>
  );
};

export default WrappedControls;