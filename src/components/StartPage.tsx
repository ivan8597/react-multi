import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LanguageSwitcher from './LanguageSwitcher';
import Instructions from './Instructions';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    #1e3c72 0%,
    #2a5298 100%
  );
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  font-size: 4rem;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
  animation: ${fadeIn} 1s ease-out;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
  text-align: center;
  animation: ${fadeIn} 1s ease-out 0.3s backwards;
  max-width: 600px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 0 20px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  animation: ${fadeIn} 1s ease-out 0.6s backwards;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 15px 40px;
  font-size: 1.2rem;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  background: ${props => props.$primary ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    background: ${props => props.$primary ? '#45a049' : 'rgba(255, 255, 255, 0.2)'};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const Cube = styled.div`
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  position: absolute;
  backdrop-filter: blur(5px);
  border-radius: 20px;
  animation: ${float} 6s ease-in-out infinite;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const Cube1 = styled(Cube)`
  top: 10%;
  left: 10%;
  animation-delay: 0s;
`;

const Cube2 = styled(Cube)`
  top: 20%;
  right: 15%;
  animation-delay: 1s;
`;

const Cube3 = styled(Cube)`
  bottom: 15%;
  left: 20%;
  animation-delay: 2s;
`;

const StartPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleStart = () => {
    navigate('/game');
  };

  return (
    <Container>
      <Cube1 />
      <Cube2 />
      <Cube3 />
      
      <Title>{t('startPage.title', '3D Раннер')}</Title>
      <Subtitle>
        {t('startPage.subtitle', 'Добро пожаловать в увлекательную 3D игру! Пройдите все уровни, избегая препятствий и устанавливая новые рекорды.')}
      </Subtitle>
      
      <ButtonContainer>
        <Button $primary onClick={handleStart}>
          <PlayArrowIcon /> {t('startPage.play', 'Играть')}
        </Button>
        <Button onClick={() => setShowInstructions(true)}>
          <HelpOutlineIcon /> {t('startPage.howToPlay', 'Как играть')}
        </Button>
      </ButtonContainer>

      <Instructions 
        isVisible={showInstructions} 
        onClose={() => setShowInstructions(false)} 
      />

      <LanguageSwitcher />
    </Container>
  );
};

export default StartPage; 