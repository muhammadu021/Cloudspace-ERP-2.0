import React from 'react'
import { Routes, Route } from 'react-router-dom'
import FileShareDashboard from './FileShareDashboard'
import FileUpload from './FileUpload'
import FileDetail from './FileDetail'
import PublicFiles from './PublicFiles'
import MyFiles from './MyFiles'
import SharedWithMe from './SharedWithMe'

const FileShare = () => {
  return (
    <Routes>
      <Route index element={<FileShareDashboard />} />
      <Route path="upload" element={<FileUpload />} />
      <Route path="public" element={<PublicFiles />} />
      <Route path="my" element={<MyFiles />} />
      <Route path="shared" element={<SharedWithMe />} />
      <Route path=":id" element={<FileDetail />} />
    </Routes>
  )
}

export default FileShare
