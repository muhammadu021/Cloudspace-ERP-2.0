import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SupportDashboard } from './SupportDashboard'
import { Tickets } from './Tickets'
import { TicketDetail } from './TicketDetail'
import { FAQ } from './FAQ'
import { SupportAnalytics } from './SupportAnalytics'

const Support = () => {
  return (
    <div className="p-6">
      <Routes>
        <Route index element={<SupportDashboard />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="analytics" element={<SupportAnalytics />} />
      </Routes>
    </div>
  )
}

export default Support
