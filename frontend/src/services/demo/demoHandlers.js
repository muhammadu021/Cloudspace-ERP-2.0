import { demoData } from './demoData';
import { generateDemoTokens, verifyDemoToken } from './demoTokens';
import { matchPath } from './demoMatcher';

const okResponse = (data, message = 'OK (Demo)') => ({
  status: 200,
  statusText: message,
  data,
});

const createResponse = (data) => ({
  status: 201,
  statusText: 'Created (Demo)',
  data,
});

const notFound = (message = 'Not found in demo data') => ({
  status: 404,
  statusText: 'Not Found (Demo)',
  data: { success: false, message },
});

const getContext = (config) => {
  const authHeader = config.headers?.Authorization || config.headers?.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const payload = verifyDemoToken(token);
  return {
    companyId: payload?.company_id,
    userEmail: payload?.email,
  };
};

const handlers = {
  'POST /auth/login': ({ config }) => {
    let data = config.data || {};
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.warn('[DemoAdapter] Failed to parse login data:', data);
      }
    }

    const { email, password } = data;
    const user = demoData.getUserByEmail(email);

    if (!user) {
      return {
        status: 401,
        statusText: 'Unauthorized (Demo)',
        data: { success: false, message: 'User not found' },
      };
    }

    // Check password: either the stored password (for registered users) or default 'demo123'
    const validPassword = user.password || 'demo123';
    if (password !== validPassword) {
      return {
        status: 401,
        statusText: 'Unauthorized (Demo)',
        data: { success: false, message: 'Invalid credentials' },
      };
    }

    const tokens = generateDemoTokens(user);

    return okResponse({
      success: true,
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  },
  'POST /auth/register': ({ config }) => {
    let data = config.data || {};
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.warn('[DemoAdapter] Failed to parse registration data:', data);
      }
    }

    const {
      company_name,
      company_code,
      company_details = {},
      username,
      email,
      password,
      first_name,
      last_name,
      phone,
      user_types = []
    } = data;

    // Check if company code already exists
    const existingCompany = demoData.getCompanyByCode?.(company_code);
    if (existingCompany) {
      return {
        status: 400,
        statusText: 'Bad Request',
        data: { success: false, message: 'Company code already exists' },
      };
    }

    // Check if email already exists
    const existingUser = demoData.getUserByEmail(email);
    if (existingUser) {
      return {
        status: 400,
        statusText: 'Bad Request',
        data: { success: false, message: 'Email already registered' },
      };
    }

    // Create company with auto-approved status
    const newCompany = demoData.addCompany?.({
      name: company_name,
      code: company_code,
      ...company_details,
      status: 'approved', // Auto-approve for demo mode
      approved_at: new Date().toISOString(),
    });

    const companyId = newCompany?.id || Date.now();

    // Create admin user
    const newUser = demoData.addUser?.({
      username,
      email,
      password, // In demo mode, we store it (not secure, but it's demo)
      first_name: first_name || username,
      last_name: last_name || '',
      phone: phone || '',
      company_id: companyId,
      company_name: company_name,
      user_type_id: 1,
      role_id: 1,
      department_id: null,
      avatar: '/placeholder-user.jpg',
      UserType: {
        id: 1,
        name: 'System Admin',
        sidebar_modules: user_types[0]?.sidebar_modules || [
          { module_id: 'dashboard', enabled: true },
          { module_id: 'projects', enabled: true },
          { module_id: 'inventory', enabled: true },
          { module_id: 'hr', enabled: true },
          { module_id: 'finance', enabled: true },
          { module_id: 'admin', enabled: true },
          { module_id: 'sales', enabled: true },
        ],
      },
      Role: {
        id: 1,
        name: 'System Administrator',
      },
    });

    // Generate tokens for immediate login
    const tokens = generateDemoTokens(newUser);

    return createResponse({
      success: true,
      message: 'Company registered successfully. You can now log in.',
      data: {
        company: newCompany,
        user: newUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  },
  'POST /auth/logout': () => okResponse({ success: true }),
  'POST /auth/refresh': ({ config }) => {
    const { refreshToken } = config.data || {};
    const payload = verifyDemoToken(refreshToken);

    if (!payload) {
      return {
        status: 401,
        data: { success: false, message: 'Invalid refresh token (demo)' },
      };
    }

    const user = demoData.getUserByEmail(payload.email);
    if (!user) {
      return notFound('User no longer available in demo data');
    }

    const tokens = generateDemoTokens(user);
    return okResponse({ success: true, data: tokens });
  },
  'GET /auth/me': ({ config }) => {
    const authHeader = config.headers?.Authorization || config.headers?.authorization;
    const token = authHeader?.replace('Bearer ', '') || config.params?.token;
    const payload = verifyDemoToken(token);

    if (!payload) {
      return {
        status: 401,
        data: { success: false, message: 'Demo session expired' },
      };
    }

    const user = demoData.getUserByEmail(payload.email);
    return okResponse({ success: true, data: { user } });
  },

  'GET /dashboard': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: demoData.getProjectsOverview(companyId) });
  },
  'GET /dashboard/stats': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: demoData.getDashboardStats(companyId) });
  },
  'GET /dashboard/projects-overview': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: demoData.getProjectsOverview(companyId) });
  },
  'GET /dashboard/tasks-overview': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: demoData.getTasksOverview(companyId) });
  },
  'GET /dashboard/financial-overview': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: demoData.getFinancials(companyId) });
  },
  'GET /dashboard/hr-overview': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: demoData.getDashboardStats(companyId)?.hrOverview });
  },
  'GET /dashboard/inventory-overview': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: demoData.getInventoryItems(companyId) });
  },
  'GET /dashboard/notifications': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { notifications: demoData.getNotifications(companyId) } });
  },
  'PATCH /dashboard/notifications/:id/read': ({ params }) => {
    return okResponse({ success: true, data: demoData.markNotificationAsRead(params.id) });
  },
  'PATCH /dashboard/notifications/mark-all-read': ({ config }) => {
    const { companyId } = getContext(config);
    demoData.markAllNotificationsAsRead(companyId);
    return okResponse({ success: true });
  },
  'DELETE /dashboard/notifications/:id': ({ params }) => {
    demoData.deleteNotification(params.id);
    return okResponse({ success: true });
  },
  'GET /dashboard/activity': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { activity: demoData.getDashboardActivity(companyId) } });
  },

  // ==================== INVENTORY ====================
  'GET /inventory/items': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { items: demoData.getInventoryItems ? demoData.getInventoryItems(companyId) : [] } });
  },
  'GET /inventory/dashboard/stats': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: demoData.getInventoryStats(companyId) });
  },
  'GET /inventory/locations': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { locations: demoData.getInventoryLocations ? demoData.getInventoryLocations(companyId) : [] } });
  },
  'GET /inventory/movements': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { movements: demoData.getInventoryMovements ? demoData.getInventoryMovements(companyId) : [] } });
  },

  'GET /dashboard/recent-activities': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { activity: demoData.getDashboardActivity(companyId) } });
  },
  'GET /dashboard/quick-actions': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { quickActions: demoData.getDashboardQuickActions(companyId) } });
  },
  'GET /dashboard/alerts': () => okResponse({ success: true, data: { alerts: demoData.getAlerts() } }),

  'GET /projects': ({ config }) => {
    const { companyId } = getContext(config);
    const params = config.params || {};
    let projects = [...demoData.getProjects(companyId)];

    if (params.search) {
      const query = params.search.toLowerCase();
      projects = projects.filter((project) =>
        project.name.toLowerCase().includes(query) || project.code.toLowerCase().includes(query)
      );
    }

    return okResponse({
      success: true,
      data: {
        projects,
        pagination: {
          total: projects.length,
          perPage: params.limit || 10,
          currentPage: params.page || 1,
          totalPages: 1,
        },
      },
    });
  },
  'GET /projects/dashboard': ({ config }) => {
    const { companyId } = getContext(config);
    const projects = demoData.getProjects(companyId);
    const tasks = demoData.getTasks(companyId);
    return okResponse({
      success: true,
      data: {
        stats: {
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === 'in_progress').length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          overdueProjects: projects.filter(p => p.status === 'delayed').length,
          averageProgress: projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / (projects.length || 1)
        }
      }
    });
  },
  'GET /projects/dashboard/stats': ({ config }) => {

    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { stats: demoData.getProjectStats(companyId) } });
  },
  'POST /projects': ({ config }) => {
    const { companyId } = getContext(config);
    const project = demoData.addProject({ ...config.data, company_id: companyId });
    return createResponse({ success: true, data: project });
  },
  'PUT /projects/:id': ({ params, config }) => {
    const updated = demoData.updateProject(params.id, config.data || {});
    if (!updated) return notFound('Project not found (demo)');
    return okResponse({ success: true, data: updated });
  },
  'DELETE /projects/:id': ({ params }) => {
    demoData.deleteProject(params.id);
    return okResponse({ success: true });
  },

  'GET /hr/employees': ({ config }) => {
    const { companyId } = getContext(config);
    const employees = demoData.getEmployees(companyId);
    return okResponse({
      success: true,
      data: {
        employees,
        pagination: { totalPages: 1, total: employees.length },
      },
    });
  },
  'POST /hr/employees': ({ config }) => {
    const { companyId } = getContext(config);
    return createResponse({ success: true, data: demoData.addEmployee({ ...config.data, company_id: companyId }) });
  },
  'PUT /hr/employees/:id': ({ params, config }) => {
    const updated = demoData.updateEmployee(params.id, config.data || {});
    if (!updated) return notFound('Employee not found');
    return okResponse({ success: true, data: updated });
  },
  'DELETE /hr/employees/:id': ({ params }) => {
    demoData.deleteEmployee(params.id);
    return okResponse({ success: true });
  },
  'GET /hr/dashboard/stats': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { stats: demoData.getHRStats(companyId) } });
  },

  'GET /hr/departments': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { departments: demoData.getDepartments(companyId) } });
  },
  'POST /hr/departments': ({ config }) => {
    const { companyId } = getContext(config);
    return createResponse({ success: true, data: demoData.addDepartment({ ...config.data, company_id: companyId }) });
  },
  'PUT /hr/departments/:id': ({ params, config }) => {
    const updated = demoData.updateDepartment(params.id, config.data || {});
    if (!updated) return notFound('Department not found');
    return okResponse({ success: true, data: updated });
  },
  'DELETE /hr/departments/:id': ({ params }) => {
    demoData.deleteDepartment(params.id);
    return okResponse({ success: true });
  },

  'GET /hr/leaves': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { leaves: demoData.getLeaves(companyId) } });
  },
  'POST /hr/leaves': ({ config }) => {
    const { companyId } = getContext(config);
    return createResponse({ success: true, data: demoData.addLeaveRequest({ ...config.data, company_id: companyId }) });
  },
  'PATCH /hr/leaves/:id/approve': ({ params }) =>
    okResponse({
      success: true,
      data: demoData.updateLeaveRequest(params.id, { status: 'approved' }),
    }),
  'PATCH /hr/leaves/:id/reject': ({ params, config }) =>
    okResponse({
      success: true,
      data: demoData.updateLeaveRequest(params.id, { status: 'rejected', rejection_reason: config.data?.reason }),
    }),

  'GET /inventory/items': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { items: demoData.getInventoryItems(companyId) } });
  },
  'POST /inventory/items': ({ config }) => {
    const { companyId } = getContext(config);
    return createResponse({ success: true, data: demoData.addInventoryItem({ ...config.data, company_id: companyId }) });
  },
  'PUT /inventory/items/:id': ({ params, config }) => {
    const updated = demoData.updateInventoryItem(params.id, config.data || {});
    if (!updated) return notFound('Inventory item not found');
    return okResponse({ success: true, data: updated });
  },
  'DELETE /inventory/items/:id': ({ params }) => {
    demoData.deleteInventoryItem(params.id);
    return okResponse({ success: true });
  },

  'GET /inventory/locations': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { locations: demoData.getInventoryLocations(companyId) } });
  },
  'POST /inventory/locations': ({ config }) => {
    const { companyId } = getContext(config);
    return createResponse({ success: true, data: demoData.addInventoryLocation({ ...config.data, company_id: companyId }) });
  },

  'GET /inventory/movements': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { movements: demoData.getInventoryMovements(companyId) } });
  },
  'POST /inventory/movements': ({ config }) => {
    const { companyId } = getContext(config);
    return createResponse({ success: true, data: demoData.recordInventoryMovement({ ...config.data, company_id: companyId }) });
  },

  'GET /purchase-requests': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { requests: demoData.getPurchaseRequests(companyId) } });
  },
  'POST /purchase-requests': ({ config }) => {
    const { companyId } = getContext(config);
    return createResponse({ success: true, data: demoData.addPurchaseRequest({ ...config.data, company_id: companyId }) });
  },
  'PATCH /purchase-requests/:id/approve': ({ params }) =>
    okResponse({ success: true, data: demoData.updatePurchaseRequest(params.id, { status: 'approved' }) }),
  'PATCH /purchase-requests/:id/reject': ({ params, config }) =>
    okResponse({ success: true, data: demoData.updatePurchaseRequest(params.id, { status: 'rejected', reason: config.data }) }),

  'GET /finance/payroll': ({ config }) => {
    const { companyId } = getContext(config);
    const payroll = demoData.getPayroll(companyId);
    return okResponse({ success: true, data: payroll });
  },
  'GET /finance/dashboard/stats': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { stats: demoData.getFinanceStats(companyId) } });
  },
  'POST /finance/payroll': ({ config }) => {
    const { companyId } = getContext(config);
    return createResponse({ success: true, data: demoData.addPayrollBatch({ ...config.data, company_id: companyId }) });
  },
  'PATCH /finance/payroll/:id/approve': ({ params }) =>
    okResponse({ success: true, data: demoData.approvePayrollBatch(params.id, 'approved') }),
  'PATCH /finance/payroll/:id/reject': ({ params }) =>
    okResponse({ success: true, data: demoData.approvePayrollBatch(params.id, 'rejected') }),

  'GET /finance/expenses': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { expenses: demoData.getExpenses(companyId) } });
  },
  'POST /finance/expenses': ({ config }) => {
    const { companyId } = getContext(config);
    return createResponse({ success: true, data: demoData.addExpense({ ...config.data, company_id: companyId }) });
  },
  'GET /finance/expenses/stats': ({ config }) => {
    const { companyId } = getContext(config);
    const stats = demoData.getExpenseStats(companyId);
    return okResponse({ success: true, data: stats });
  },
  'PUT /finance/expenses/:id': ({ params, config }) =>
    okResponse({ success: true, data: demoData.updateExpense(params.id, config.data || {}) }),

  'GET /self-service/documents': ({ config }) => {
    const { companyId } = getContext(config);
    const docs = demoData.getDocuments({ ...config.params, visibility: 'private', company_id: companyId });
    return okResponse({ success: true, data: { documents: docs, pagination: { totalPages: 1, totalItems: docs.length } } });
  },
  'GET /self-service/documents/department': ({ config }) => {
    const { companyId } = getContext(config);
    const docs = demoData.getDocuments({ ...config.params, visibility: 'department', company_id: companyId });
    return okResponse({ success: true, data: { documents: docs, pagination: { totalPages: 1, totalItems: docs.length } } });
  },
  'GET /self-service/documents/public': ({ config }) => {
    const { companyId } = getContext(config);
    const docs = demoData.getDocuments({ ...config.params, visibility: 'public', company_id: companyId });
    return okResponse({ success: true, data: { documents: docs, pagination: { totalPages: 1, totalItems: docs.length } } });
  },
  'GET /self-service/documents/shared': ({ config }) => {
    const { companyId } = getContext(config);
    const docs = demoData.getDocuments({ ...config.params, visibility: 'shared', company_id: companyId });
    return okResponse({ success: true, data: { documents: docs, pagination: { totalPages: 1, totalItems: docs.length } } });
  },
  'POST /self-service/documents': ({ config }) => {
    const { companyId } = getContext(config);
    const document = demoData.addDocument({ ...config.data, file_size: config.data?.file?.size || 51200, company_id: companyId });
    return createResponse({ success: true, data: document });
  },
  'DELETE /self-service/documents/:id': ({ params }) => {
    demoData.deleteDocument(params.id);
    return okResponse({ success: true });
  },
  'GET /self-service/documents/:id/download': ({ params }) => {
    const document = demoData.getDocuments().find((doc) => doc.id === params.id);
    if (!document) return notFound('Document not found');
    const blob = new Blob([document.content || 'Demo document content'], { type: document.mime_type || 'text/plain' });
    return okResponse(blob);
  },
  'GET /self-service/folders': ({ config }) => {
    const { companyId } = getContext(config);
    const folders = demoData.getFolders({ ...(config.params || {}), company_id: companyId });
    return okResponse({ success: true, data: { folders } });
  },
  'POST /self-service/folders': ({ config }) => {
    const { companyId } = getContext(config);
    const folder = demoData.addFolder({ ...config.data, company_id: companyId });
    return createResponse({ success: true, data: folder });
  },
  'DELETE /self-service/folders/:id': ({ params }) => {
    demoData.deleteFolder(params.id);
    return okResponse({ success: true });
  },

  // ==================== RECRUITMENT MODULE ====================
  'GET /hr/recruitment/jobs': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { jobPostings: demoData.getJobPostings(companyId) } });
  },
  'GET /hr/recruitment/dashboard-stats': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { stats: demoData.getRecruitmentStats(companyId) } });
  },
  'POST /hr/recruitment/jobs': ({ config }) => createResponse({ success: true, data: { jobPosting: demoData.addJobPosting(config.data || {}) } }),
  'PUT /hr/recruitment/jobs/:id': ({ params, config }) => {
    const updated = demoData.updateJobPosting(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { jobPosting: updated } }) : notFound('Job posting not found');
  },
  'DELETE /hr/recruitment/jobs/:id': ({ params }) => {
    demoData.deleteJobPosting(params.id);
    return okResponse({ success: true });
  },

  'GET /hr/recruitment/candidates': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { candidates: demoData.getCandidates(companyId) } });
  },
  'POST /hr/recruitment/candidates': ({ config }) => createResponse({ success: true, data: { candidate: demoData.addCandidate(config.data || {}) } }),
  'GET /hr/recruitment/applications': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { applications: demoData.getApplications(companyId) } });
  },
  'PUT /hr/recruitment/candidates/:id': ({ params, config }) => {
    const updated = demoData.updateCandidate(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { candidate: updated } }) : notFound('Candidate not found');
  },

  'GET /hr/recruitment/applications': () => okResponse({ success: true, data: { applications: demoData.getApplications() } }),
  'GET /hr/recruitment/applications/:id': ({ params }) => {
    const app = demoData.getApplications().find(a => String(a.id) === String(params.id));
    return app ? okResponse({ success: true, data: { application: app } }) : notFound('Application not found');
  },
  'POST /hr/recruitment/applications': ({ config }) => createResponse({ success: true, data: { application: demoData.addApplication(config.data || {}) } }),
  'PUT /hr/recruitment/applications/:id': ({ params, config }) => {
    const updated = demoData.updateApplication(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { application: updated } }) : notFound('Application not found');
  },

  'GET /hr/recruitment/interviews': () => okResponse({ success: true, data: { interviews: demoData.getInterviews() } }),
  'POST /hr/recruitment/interviews': ({ config }) => createResponse({ success: true, data: { interview: demoData.addInterview(config.data || {}) } }),
  'PUT /hr/recruitment/interviews/:id': ({ params, config }) => {
    const updated = demoData.updateInterview(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { interview: updated } }) : notFound('Interview not found');
  },

  'GET /hr/recruitment/evaluations': () => okResponse({ success: true, data: { evaluations: demoData.getEvaluations() } }),
  'POST /hr/recruitment/evaluations': ({ config }) => createResponse({ success: true, data: { evaluation: demoData.addEvaluation(config.data || {}) } }),

  'GET /hr/recruitment/background-checks': () => okResponse({ success: true, data: { backgroundChecks: demoData.getBackgroundChecks() } }),
  'POST /hr/recruitment/background-checks': ({ config }) => createResponse({ success: true, data: { backgroundCheck: demoData.addBackgroundCheck(config.data || {}) } }),

  'GET /hr/recruitment/offers': () => okResponse({ success: true, data: { offerLetters: demoData.getOfferLetters() } }),
  'POST /hr/recruitment/offers': ({ config }) => createResponse({ success: true, data: { offerLetter: demoData.addOfferLetter(config.data || {}) } }),
  'PUT /hr/recruitment/offers/:id': ({ params, config }) => {
    const updated = demoData.updateOfferLetter(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { offerLetter: updated } }) : notFound('Offer letter not found');
  },
  'POST /hr/recruitment/offers/:id/send': ({ params }) => okResponse({ success: true, message: 'Offer letter sent (demo)' }),

  'GET /hr/recruitment/job-channels': () => okResponse({ success: true, data: { jobChannels: demoData.getJobChannels() } }),
  'POST /hr/recruitment/job-channels': ({ config }) => createResponse({ success: true, data: { jobChannel: demoData.addJobChannel(config.data || {}) } }),

  'GET /hr/recruitment/dashboard-stats': () => okResponse({ success: true, data: { openPositions: 0, totalApplications: 0, scheduledInterviews: 0 } }),
  'GET /hr/recruitment/analytics': () => okResponse({ success: true, data: { totalJobPostings: 0, activeJobPostings: 0 } }),

  // ==================== PERFORMANCE MODULE ====================
  'GET /hr/performance/cycles': () => okResponse({ success: true, data: { cycles: demoData.getReviewCycles() } }),
  'POST /hr/performance/cycles': ({ config }) => createResponse({ success: true, data: { cycle: demoData.addReviewCycle(config.data || {}) } }),
  'PUT /hr/performance/cycles/:id': ({ params, config }) => {
    const updated = demoData.updateReviewCycle(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { cycle: updated } }) : notFound('Review cycle not found');
  },
  'DELETE /hr/performance/cycles/:id': ({ params }) => {
    demoData.deleteReviewCycle?.(params.id);
    return okResponse({ success: true });
  },

  'GET /hr/performance/reviews': () => okResponse({ success: true, data: { reviews: demoData.getReviews() } }),
  'GET /hr/performance/reviews/:id': ({ params }) => {
    const review = demoData.getReviews().find(r => String(r.id) === String(params.id));
    return review ? okResponse({ success: true, data: { review } }) : notFound('Review not found');
  },
  'POST /hr/performance/reviews': ({ config }) => createResponse({ success: true, data: { review: demoData.addReview(config.data || {}) } }),
  'PUT /hr/performance/reviews/:id': ({ params, config }) => {
    const updated = demoData.updateReview(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { review: updated } }) : notFound('Review not found');
  },
  'PATCH /hr/performance/reviews/:id/submit': ({ params }) => {
    const updated = demoData.updateReview(params.id, { status: 'pending_approval' });
    return updated ? okResponse({ success: true, data: { review: updated } }) : notFound('Review not found');
  },
  'PATCH /hr/performance/reviews/:id/approve': ({ params }) => {
    const updated = demoData.updateReview(params.id, { status: 'completed' });
    return updated ? okResponse({ success: true, data: { review: updated } }) : notFound('Review not found');
  },

  'GET /hr/performance/goals': () => okResponse({ success: true, data: { goals: demoData.getGoals() } }),
  'POST /hr/performance/goals': ({ config }) => createResponse({ success: true, data: { goal: demoData.addGoal(config.data || {}) } }),
  'PUT /hr/performance/goals/:id': ({ params, config }) => {
    const updated = demoData.updateGoal(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { goal: updated } }) : notFound('Goal not found');
  },
  'PATCH /hr/performance/goals/:id/progress': ({ params, config }) => {
    const updated = demoData.updateGoal(params.id, { progress: config.data?.progress });
    return updated ? okResponse({ success: true, data: { goal: updated } }) : notFound('Goal not found');
  },

  'GET /hr/performance/feedback': () => okResponse({ success: true, data: { feedbackRequests: demoData.getFeedbackRequests() } }),
  'POST /hr/performance/feedback': ({ config }) => createResponse({ success: true, data: { feedbackRequest: demoData.addFeedbackRequest(config.data || {}) } }),
  'POST /hr/performance/feedback/:id/submit': ({ params, config }) => {
    const updated = demoData.updateFeedbackRequest?.(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { feedbackRequest: updated } }) : okResponse({ success: true });
  },

  'GET /hr/performance/pips': () => okResponse({ success: true, data: { pips: demoData.getPIPs() } }),
  'POST /hr/performance/pips': ({ config }) => createResponse({ success: true, data: { pip: demoData.addPIP(config.data || {}) } }),
  'PUT /hr/performance/pips/:id': ({ params, config }) => {
    const updated = demoData.updatePIP(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { pip: updated } }) : notFound('PIP not found');
  },
  'POST /hr/performance/pips/:id/progress': ({ params, config }) => {
    const updated = demoData.updatePIP(params.id, { progress: config.data });
    return updated ? okResponse({ success: true, data: { pip: updated } }) : notFound('PIP not found');
  },
  'PATCH /hr/performance/pips/:id/complete': ({ params, config }) => {
    const updated = demoData.updatePIP(params.id, { status: 'completed', outcome: config.data });
    return updated ? okResponse({ success: true, data: { pip: updated } }) : notFound('PIP not found');
  },

  'GET /hr/performance/career-plans': () => okResponse({ success: true, data: { careerPlans: demoData.getCareerPlans() } }),
  'POST /hr/performance/career-plans': ({ config }) => createResponse({ success: true, data: { careerPlan: demoData.addCareerPlan(config.data || {}) } }),
  'PUT /hr/performance/career-plans/:id': ({ params, config }) => {
    const updated = demoData.updateCareerPlan(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { careerPlan: updated } }) : notFound('Career plan not found');
  },

  'GET /hr/performance/career-paths': () => okResponse({ success: true, data: { careerPaths: [] } }),
  'POST /hr/performance/career-paths': ({ config }) => createResponse({ success: true, data: { careerPath: { id: Date.now(), ...config.data } } }),
  'PUT /hr/performance/career-paths/:id': ({ params, config }) => okResponse({ success: true, data: { careerPath: { id: params.id, ...config.data } } }),

  'GET /hr/performance/skill-assessments': () => okResponse({ success: true, data: { skillAssessments: [] } }),
  'POST /hr/performance/skill-assessments': ({ config }) => createResponse({ success: true, data: { skillAssessment: { id: Date.now(), ...config.data } } }),
  'PUT /hr/performance/skill-assessments/:id': ({ params, config }) => okResponse({ success: true, data: { skillAssessment: { id: params.id, ...config.data } } }),
  'PATCH /hr/performance/skill-assessments/:id/complete': ({ params }) => okResponse({ success: true, data: { skillAssessment: { id: params.id, status: 'completed' } } }),

  'GET /hr/performance/rating-scales': () => okResponse({ success: true, data: { ratingScales: [] } }),
  'POST /hr/performance/rating-scales': ({ config }) => createResponse({ success: true, data: { ratingScale: { id: Date.now(), ...config.data } } }),

  'GET /hr/performance/templates': () => okResponse({ success: true, data: { templates: [] } }),
  'GET /hr/performance/templates/:id': ({ params }) => okResponse({ success: true, data: { template: { id: params.id } } }),
  'POST /hr/performance/templates': ({ config }) => createResponse({ success: true, data: { template: { id: Date.now(), ...config.data } } }),

  'GET /hr/performance/dashboard-stats': () => okResponse({ success: true, data: { totalReviews: 0, pendingReviews: 0 } }),
  'GET /hr/performance/analytics': () => okResponse({ success: true, data: {} }),
  'GET /hr/performance/team-analytics': () => okResponse({ success: true, data: {} }),

  // ==================== TRAINING MODULE ====================
  'GET /hr/training/courses': () => okResponse({ success: true, data: { courses: demoData.getCourses() } }),
  'GET /hr/training/courses/:id': ({ params }) => {
    const course = demoData.getCourses().find(c => String(c.id) === String(params.id));
    return course ? okResponse({ success: true, data: { course } }) : notFound('Course not found');
  },
  'POST /hr/training/courses': ({ config }) => createResponse({ success: true, data: { course: demoData.addCourse(config.data || {}) } }),
  'PUT /hr/training/courses/:id': ({ params, config }) => {
    const updated = demoData.updateCourse(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { course: updated } }) : notFound('Course not found');
  },
  'DELETE /hr/training/courses/:id': ({ params }) => {
    demoData.deleteCourse(params.id);
    return okResponse({ success: true });
  },

  'GET /hr/training/learning-paths': () => okResponse({ success: true, data: { learningPaths: [] } }),
  'POST /hr/training/learning-paths': ({ config }) => createResponse({ success: true, data: { learningPath: { id: Date.now(), ...config.data } } }),

  'GET /hr/training/sessions': () => okResponse({ success: true, data: { sessions: demoData.getTrainingSessions() } }),
  'POST /hr/training/sessions': ({ config }) => createResponse({ success: true, data: { session: demoData.addTrainingSession(config.data || {}) } }),

  'GET /hr/training/enrollments': () => okResponse({ success: true, data: { enrollments: demoData.getEnrollments() } }),
  'POST /hr/training/enrollments': ({ config }) => createResponse({ success: true, data: { enrollment: demoData.addEnrollment(config.data || {}) } }),

  'GET /hr/training/instructors': () => okResponse({ success: true, data: { instructors: demoData.getInstructors() } }),
  'POST /hr/training/instructors': ({ config }) => createResponse({ success: true, data: { instructor: demoData.addInstructor(config.data || {}) } }),

  'GET /hr/training/certifications': () => okResponse({ success: true, data: { certifications: [] } }),
  'POST /hr/training/certifications': ({ config }) => createResponse({ success: true, data: { certification: { id: Date.now(), ...config.data } } }),

  'GET /hr/training/progress': () => okResponse({ success: true, data: { progress: [] } }),
  'POST /hr/training/progress': ({ config }) => createResponse({ success: true, data: { progress: { id: Date.now(), ...config.data } } }),

  'GET /hr/training/budgets': () => okResponse({ success: true, data: { budgets: [] } }),
  'POST /hr/training/budgets': ({ config }) => createResponse({ success: true, data: { budget: { id: Date.now(), ...config.data } } }),

  'GET /hr/training/compliance': () => okResponse({ success: true, data: { complianceTraining: [] } }),
  'POST /hr/training/compliance': ({ config }) => createResponse({ success: true, data: { complianceTraining: { id: Date.now(), ...config.data } } }),

  'GET /hr/training/dashboard-stats': () => okResponse({ success: true, data: { totalCourses: 0, activeSessions: 0 } }),
  'GET /hr/training/analytics': () => okResponse({ success: true, data: {} }),

  // ==================== SALES MODULE ====================
  'GET /sales/orders': () => okResponse({ success: true, data: { orders: demoData.getOrders() } }),
  'POST /sales/orders': ({ config }) => createResponse({ success: true, data: { order: demoData.addOrder(config.data || {}) } }),
  'PUT /sales/orders/:id': ({ params, config }) => {
    const updated = demoData.updateOrder(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { order: updated } }) : notFound('Order not found');
  },

  'GET /sales/customers': () => okResponse({ success: true, data: { customers: demoData.getCustomers() } }),
  'POST /sales/customers': ({ config }) => createResponse({ success: true, data: { customer: demoData.addCustomer(config.data || {}) } }),
  'PUT /sales/customers/:id': ({ params, config }) => {
    const updated = demoData.updateCustomer(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { customer: updated } }) : notFound('Customer not found');
  },

  'GET /sales/dashboard': () => okResponse({ success: true, data: { totalRevenue: 0, totalOrders: 0 } }),

  // ==================== COLLABORATION MODULE ====================
  'GET /collaboration/teams': () => okResponse({ success: true, data: { teams: demoData.getTeams() } }),
  'POST /collaboration/teams': ({ config }) => createResponse({ success: true, data: { team: demoData.addTeam(config.data || {}) } }),

  'GET /collaboration/messages': () => okResponse({ success: true, data: { messages: demoData.getMessages() } }),
  'POST /collaboration/messages': ({ config }) => createResponse({ success: true, data: { message: demoData.addMessage(config.data || {}) } }),

  'GET /collaboration/announcements': () => okResponse({ success: true, data: { announcements: demoData.getAnnouncements() } }),
  'POST /collaboration/announcements': ({ config }) => createResponse({ success: true, data: { announcement: demoData.addAnnouncement(config.data || {}) } }),

  'GET /collaboration/events': () => okResponse({ success: true, data: { events: demoData.getEvents() } }),
  'POST /collaboration/events': ({ config }) => createResponse({ success: true, data: { event: demoData.addEvent(config.data || {}) } }),

  // ==================== ADMIN MODULE ====================
  'GET /admin/assets': () => okResponse({ success: true, data: { assets: demoData.getAssets() } }),
  'POST /admin/assets': ({ config }) => createResponse({ success: true, data: { asset: demoData.addAsset(config.data || {}) } }),
  'PUT /admin/assets/:id': ({ params, config }) => {
    const updated = demoData.updateAsset(params.id, config.data || {});
    return updated ? okResponse({ success: true, data: { asset: updated } }) : notFound('Asset not found');
  },
  'DELETE /admin/assets/:id': ({ params }) => {
    demoData.deleteAsset(params.id);
    return okResponse({ success: true });
  },

  'GET /admin/audit-logs': () => okResponse({ success: true, data: { logs: demoData.getAuditLogs() } }),

  // ==================== MISC HANDLERS ====================
  'GET /auth/modules': () => okResponse({ success: true, data: { modules: [] } }),
  'GET /notifications': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { notifications: demoData.getNotifications(companyId) } });
  },
  'GET /notifications/unread-count': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { count: demoData.getNotifications(companyId).filter(n => !n.read_at).length } });
  },
  'GET /purchase-requests/pending/approval': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { requests: demoData.getPurchaseRequestsByStatus('pending_approval', companyId) } });
  },
  'GET /purchase-requests/pending/procurement': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { requests: demoData.getPurchaseRequestsByStatus('procurement_pending', companyId) } });
  },
  'GET /purchase-requests/pending/finance': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { requests: demoData.getPurchaseRequestsByStatus('finance_pending', companyId) } });
  },
  'GET /inventory/dashboard/stats': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { stats: demoData.getInventoryStats(companyId) } });
  },

  // ==================== SELF SERVICE ====================
  'GET /self-service/benefits': ({ config }) => {
    const { companyId } = getContext(config);
    const benefits = demoData.getBenefits(companyId);
    return okResponse({ success: true, data: benefits });
  },
  'POST /self-service/benefits/:id/enroll': ({ params, config }) => {
    const { companyId } = getContext(config);
    const updated = demoData.updateBenefitEnrollment(params.id, config.data?.enrolled, companyId);
    return updated ? okResponse({ success: true, data: updated }) : notFound('Benefit not found');
  },

  // ==================== ADMINISTRATIVE ====================
  'GET /companies/current': ({ config }) => {
    const { companyId } = getContext(config);
    const company = demoData.getCompanyById(companyId);
    return okResponse({ success: true, data: { company } });
  },
  'GET /user-types': ({ config }) => {
    const { companyId } = getContext(config);
    return okResponse({ success: true, data: { userTypes: demoData.getUserTypes(companyId) } });
  },
  'POST /user-types': ({ config }) => {
    const { companyId } = getContext(config);
    const userType = demoData.addUserType({ ...config.data, company_id: companyId });
    return createResponse({ success: true, data: userType });
  },
  'PUT /user-types/:id': ({ params, config }) => {
    const updated = demoData.updateUserType(params.id, config.data);
    return updated ? okResponse({ success: true, data: updated }) : notFound('User type not found');
  },
  'DELETE /user-types/:id': ({ params }) => {
    demoData.deleteUserType(params.id);
    return okResponse({ success: true });
  },
  'GET /admin/users': ({ config }) => {
    const { companyId } = getContext(config);
    const users = demoData.getUsers().filter(u => !companyId || String(u.company_id) === String(companyId));
    return okResponse({ success: true, data: { users } });
  },
  'PATCH /admin/users/:id/user-type': ({ params, config }) => {
    const user = demoData.getUsers().find(u => String(u.id) === String(params.id));
    if (user) {
      user.user_type_id = config.data.user_type_id;
      demoData.persist();
      return okResponse({ success: true, data: user });
    }
    return notFound('User not found');
  },

  // ==================== HR TASKS ====================
  'GET /hr/tasks': ({ config }) => {
    const { companyId } = getContext(config);
    const tasks = demoData.getTasks ? demoData.getTasks(companyId) : [];
    return okResponse({ success: true, data: { tasks } });
  },
  'GET /hr/tasks/stats': ({ config }) => {
    const { companyId } = getContext(config);
    const tasks = demoData.getTasks ? demoData.getTasks(companyId) : [];
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
    return okResponse({ success: true, data: stats });
  },
  'POST /hr/tasks': ({ config }) => {
    const { companyId } = getContext(config);
    const task = {
      id: Date.now(),
      ...config.data,
      company_id: companyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return createResponse({ success: true, data: { task } });
  },
  'PUT /hr/tasks/:id': ({ params, config }) => {
    return okResponse({ 
      success: true, 
      data: { task: { id: params.id, ...config.data, updated_at: new Date().toISOString() } } 
    });
  },
  'DELETE /hr/tasks/:id': ({ params }) => {
    return okResponse({ success: true });
  },
  'PATCH /hr/tasks/:id/assign': ({ params, config }) => {
    return okResponse({ 
      success: true, 
      data: { task: { id: params.id, ...config.data, updated_at: new Date().toISOString() } } 
    });
  },

  // ==================== DASHBOARD CONFIG & PREFERENCES ====================
  'GET /dashboard/config/:role': async ({ params }) => {
    const { getMockDashboardConfig } = await import('@/mocks/dashboardMockData');
    try {
      const config = await getMockDashboardConfig(params.role);
      console.log('[DemoAdapter] Dashboard config loaded for role:', params.role);
      console.log('[DemoAdapter] Config structure:', JSON.stringify(config, null, 2));
      return okResponse({ success: true, data: config });
    } catch (error) {
      console.error('[DemoAdapter] Dashboard config error:', error);
      return notFound(`Dashboard configuration not found for role: ${params.role}`);
    }
  },
  
  'GET /users/:userId/preferences/dashboard': async ({ params }) => {
    const { getMockUserPreferences } = await import('@/mocks/dashboardMockData');
    try {
      const preferences = await getMockUserPreferences(params.userId);
      console.log('[DemoAdapter] Dashboard preferences loaded for user:', params.userId);
      return okResponse({ success: true, data: preferences });
    } catch (error) {
      console.error('[DemoAdapter] Dashboard preferences error:', error);
      return okResponse({ success: true, data: { userId: params.userId, selectedDashboardType: null, customLayout: null } });
    }
  },
  
  'PUT /users/:userId/preferences/dashboard': async ({ params, config }) => {
    const { updateMockUserPreferences } = await import('@/mocks/dashboardMockData');
    try {
      const preferences = await updateMockUserPreferences(params.userId, config.data);
      console.log('[DemoAdapter] Dashboard preferences updated for user:', params.userId);
      return okResponse({ success: true, data: preferences });
    } catch (error) {
      console.error('[DemoAdapter] Dashboard preferences update error:', error);
      return okResponse({ success: true, data: { ...config.data, userId: params.userId } });
    }
  },
  
  'GET /widgets/:widgetId/data': async ({ params, config }) => {
    const { getMockWidgetData } = await import('@/mocks/dashboardMockData');
    try {
      const widgetConfig = config.params || {};
      const data = await getMockWidgetData(params.widgetId, widgetConfig);
      console.log('[DemoAdapter] Widget data loaded for:', params.widgetId);
      return okResponse({ success: true, data });
    } catch (error) {
      console.error('[DemoAdapter] Widget data error:', error);
      return okResponse({ success: true, data: { data: [], message: 'No data available' } });
    }
  },
  
  'POST /analytics/events': async ({ config }) => {
    const { logMockAnalyticsEvent } = await import('@/mocks/dashboardMockData');
    try {
      const event = await logMockAnalyticsEvent(config.data);
      return okResponse({ success: true, data: event });
    } catch (error) {
      console.error('[DemoAdapter] Analytics event error:', error);
      return okResponse({ success: true, data: { logged: true } });
    }
  },
};

const dynamicRoutes = Object.entries(handlers).map(([key, handler]) => {
  const [method, pattern] = key.split(' ');
  return { method, pattern, matcher: matchPath(pattern), handler };
});

const resolve = (method, path) => {
  const normalizedPath = path.replace('/cleardesk/api/v1', '');

  // direct match first
  const direct = handlers[`${method.toUpperCase()} ${normalizedPath}`];
  if (direct) {
    return (context) => direct(context);
  }

  for (const route of dynamicRoutes) {
    if (route.method !== method.toUpperCase()) continue;
    const match = route.matcher(normalizedPath);
    if (match) {
      return (context) => route.handler({ ...context, params: match.params });
    }
  }
  return null;
};

const demoHandlers = { resolve };
export default demoHandlers;
