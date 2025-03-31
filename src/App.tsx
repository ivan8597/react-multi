import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import Scene from './components/Scene';

const App = () => {
  return (
    <Provider store={store}>
      <Scene />
    </Provider>
  );
};

export default App;