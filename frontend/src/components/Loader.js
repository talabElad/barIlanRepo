// Loader.js
import React from 'react';
import '../style/Loader.scss';

const Loader = () => (
  <div className="loader">
    <div class="loader-logo">
        <img src='../../images/bar-ilan-logo.png' alt='Logo' />
    </div>
    <div class="loader-circle"></div>
    <div class="loader-line-mask">
      <div class="loader-line"></div>
    </div>
  </div>
);

export default Loader;
