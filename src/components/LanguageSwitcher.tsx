import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const SwitcherContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 190px;
  z-index: 1001;
  display: flex;
  gap: 5px;
`;

const LanguageButton = styled.button<{ $active: boolean }>`
  padding: 5px 10px;
  background: ${(props) => props.$active ? '#4a90e2' : 'rgba(0, 0, 0, 0.5)'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 1;
    transform: translateY(-2px);
  }
`;

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    console.log('Changing language to:', lng);
    i18n.changeLanguage(lng);
  };
  
  return (
    <SwitcherContainer>
      <LanguageButton 
        $active={i18n.language === 'en'} 
        onClick={() => changeLanguage('en')}
      >
        EN
      </LanguageButton>
      <LanguageButton 
        $active={i18n.language === 'ru'} 
        onClick={() => changeLanguage('ru')}
      >
        RU
      </LanguageButton>
    </SwitcherContainer>
  );
};

export default LanguageSwitcher; 