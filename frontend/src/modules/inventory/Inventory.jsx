import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { InventoryDashboard } from './InventoryDashboard'
import { Items } from './Items'
import InventoryItemForm from './InventoryItemForm'
import InventoryItemDetail from './InventoryItemDetail'
import { Locations } from './Locations'
import { Movements } from './Movements'
import { InventoryReports } from './InventoryReports'

const Inventory = () => {
  return (
    <Routes>
      <Route index element={<InventoryDashboard />} />
      <Route path="items" element={<Items />} />
      <Route path="items/new" element={<InventoryItemForm />} />
      <Route path="items/:id" element={<InventoryItemDetail />} />
      <Route path="items/:id/edit" element={<InventoryItemForm />} />
      <Route path="locations" element={<Locations />} />
      <Route path="movements" element={<Movements />} />
      <Route path="reports" element={<InventoryReports />} />
    </Routes>
  )
}

export default Inventory