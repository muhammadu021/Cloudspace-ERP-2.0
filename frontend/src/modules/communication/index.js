import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CommunicationModule from './CommunicationModule';

const Communication = () => {
  return (
    <Routes>
      <Route path="/*" element={<CommunicationModule />} />
    </Routes>
  );
};

export default Communication;