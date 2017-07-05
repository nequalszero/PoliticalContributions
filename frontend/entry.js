import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import './lib/monkey_patches';

import App from './components/app';
import './styles/css/main.css';

document.addEventListener('DOMContentLoaded', () => {
  Modal.setAppElement(document.body);
  const rootEl = document.getElementById('root');
  ReactDOM.render(<App />, rootEl);
})
