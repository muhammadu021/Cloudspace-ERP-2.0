import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SupportTickets from './SupportTickets';
import SupportFAQ from './SupportFAQ';
import { SupportAnalytics } from './SupportAnalytics';
import SupportCategories from './SupportCategories';

const SupportDesk = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="tickets" replace />} />
      <Route path="tickets" element={<SupportTickets />} />
      <Route path="categories" element={<SupportCategories />} />
      <Route path="faq" element={<SupportFAQ />} />
      <Route path="analytics" element={<SupportAnalytics />} />
    </Routes>
  );
};

export default SupportDesk;
