import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Projects from './Projects';
import ProjectDashboard from './ProjectDashboard';
import ProjectKanban from './ProjectKanban';
import ProjectCalendar from './ProjectCalendar';
import EnhancedProjectForm from './EnhancedProjectForm';
import ProjectTemplates from './ProjectTemplates';
import ProjectForm from './ProjectForm';
import ProjectDetail from './ProjectDetail';
import ProjectReports from './ProjectReports';
import ProjectAnalytics from './ProjectAnalytics';
import ProjectArchive from './ProjectArchive';
import ProjectTasks from './ProjectTasks';
import ProjectTeam from './ProjectTeam';
import ProjectTimeline from './ProjectTimeline';
import ProjectBudget from './ProjectBudget';
import ProjectSettings from './ProjectSettings';

const ProjectsModule = () => {
  return (
    <Routes>
      <Route index element={<Projects />} />
      <Route path="dashboard" element={<ProjectDashboard />} />
      <Route path="kanban" element={<ProjectKanban />} />
      <Route path="calendar" element={<ProjectCalendar />} />
      <Route path="new" element={<EnhancedProjectForm />} />
      <Route path="create" element={<EnhancedProjectForm />} />
      <Route path="templates" element={<ProjectTemplates />} />
      <Route path="templates/new" element={<ProjectForm />} />
      <Route path="templates/:id" element={<ProjectDetail />} />
      <Route path="templates/:id/edit" element={<ProjectForm />} />
      <Route path="reports" element={<ProjectReports />} />
      <Route path="analytics" element={<ProjectAnalytics />} />
      <Route path="archive" element={<ProjectArchive />} />
      <Route path="tasks" element={<ProjectTasks />} />
      <Route path="team" element={<ProjectTeam />} />
      <Route path="timeline" element={<ProjectTimeline />} />
      <Route path=":id" element={<ProjectDetail />} />
      <Route path=":id/edit" element={<ProjectForm />} />
      <Route path=":id/tasks" element={<ProjectTasks />} />
      <Route path=":id/team" element={<ProjectTeam />} />
      <Route path=":id/timeline" element={<ProjectTimeline />} />
      <Route path=":id/budget" element={<ProjectBudget />} />
      <Route path=":id/settings" element={<ProjectSettings />} />
    </Routes>
  );
};

export default ProjectsModule;