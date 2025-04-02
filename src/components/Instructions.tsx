import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GamesIcon from '@mui/icons-material/Games';

const InstructionsOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const InstructionsCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Section = styled.div`
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: #444;
  margin-bottom: 15px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Description = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  color: #666;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
  
  &:before {
    content: "•";
    position: absolute;
    left: 0;
    color: #4a90e2;
  }
`;

interface InstructionsProps {
  isVisible: boolean;
  onClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ isVisible, onClose }) => {
  const { t } = useTranslation();

  return (
    <InstructionsOverlay $isVisible={isVisible} onClick={onClose}>
      <InstructionsCard onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>

        <Title>
          <GamesIcon /> {t('instructions.title')}
        </Title>
        
        <Description>{t('instructions.description')}</Description>

        <Section>
          <SectionTitle>
            <KeyboardIcon /> {t('instructions.controls.title')}
          </SectionTitle>
          <List>
            <ListItem>{t('instructions.controls.movement')}</ListItem>
            <ListItem>{t('instructions.controls.objective')}</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>
            <GamesIcon /> {t('instructions.levels.title')}
          </SectionTitle>
          <Description>{t('instructions.levels.description')}</Description>
          <List>
            <ListItem>{t('instructions.levels.level1')}</ListItem>
            <ListItem>{t('instructions.levels.level2')}</ListItem>
            <ListItem>{t('instructions.levels.level3')}</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>
            <EmojiEventsIcon /> {t('instructions.scoring.title')}
          </SectionTitle>
          <List>
            <ListItem>{t('instructions.scoring.points')}</ListItem>
            <ListItem>{t('instructions.scoring.highscore')}</ListItem>
          </List>
        </Section>
      </InstructionsCard>
    </InstructionsOverlay>
  );
};

export default Instructions; 