import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import Scene from './components/Scene';
import LanguageSwitcher from './components/LanguageSwitcher';

const App = () => {
  return (
    <Provider store={store}>
      <LanguageSwitcher />
      <Scene />
    </Provider>
  );
};

export default App;