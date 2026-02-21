import React, { useState, useEffect } from 'react';
import hrDocumentService from '../../services/hrDocumentService';
import {
  FileText,
  Upload,
  Download,
  Search,
  Folder,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  Users,
  Shield,
  CheckCircle,
  AlertTriangle,
  Filter,
  Settings,
  PenTool,
  Archive,
  Share2,
  Star,
  Calendar,
  Tag,
  MoreVertical,
  FolderOpen,
  File,
  Image,
  FileSpreadsheet,
  FileVideo
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
  Input,
  Textarea,
  Select, Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch,
  Checkbox
} from '@/components/ui';

const DocumentManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data for development
  const mockDocuments = [
    {
      id: 1,
      title: 'Employee Handbook 2024',
      description: 'Comprehensive guide for all employees covering policies, procedures, and company culture.',
      document_type: 'handbook',
      category: 'HR Policies',
      file_name: 'employee-handbook-2024.pdf',
      file_size: 2048576,
      mime_type: 'application/pdf',
      version: '2.1',
      status: 'published',
      priority: 'high',
      confidentiality_level: 'internal',
      owner: {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@company.com'
      },
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-03-10T14:30:00Z',
      approved_at: '2024-01-20T16:00:00Z',
      published_at: '2024-01-22T09:00:00Z',
      download_count: 1247,
      view_count: 3456,
      requires_signature: false,
      requires_acknowledgment: true,
      tags: ['HR', 'Policy', 'Handbook', 'Onboarding'],
      effective_date: '2024-02-01',
      expiry_date: '2024-12-31',
      next_review_date: '2024-06-01'
    },
    {
      id: 2,
      title: 'Remote Work Policy',
      description: 'Guidelines and procedures for remote work arrangements and hybrid work models.',
      document_type: 'policy',
      category: 'Work Policies',
      file_name: 'remote-work-policy-v3.docx',
      file_size: 512000,
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      version: '3.0',
      status: 'under_review',
      priority: 'medium',
      confidentiality_level: 'internal',
      owner: {
        first_name: 'Mike',
        last_name: 'Brown',
        email: 'mike.brown@company.com'
      },
      created_at: '2024-02-20T11:00:00Z',
      updated_at: '2024-03-15T10:20:00Z',
      download_count: 89,
      view_count: 234,
      requires_signature: true,
      requires_acknowledgment: true,
      tags: ['Remote Work', 'Policy', 'Hybrid', 'Flexibility'],
      effective_date: '2024-04-01',
      next_review_date: '2024-09-01'
    },
    {
      id: 3,
      title: 'Code of Conduct',
      description: 'Ethical guidelines and behavioral expectations for all company employees.',
      document_type: 'compliance',
      category: 'Compliance',
      file_name: 'code-of-conduct-2024.pdf',
      file_size: 1024000,
      mime_type: 'application/pdf',
      version: '1.5',
      status: 'published',
      priority: 'critical',
      confidentiality_level: 'public',
      owner: {
        first_name: 'Alice',
        last_name: 'Wilson',
        email: 'alice.wilson@company.com'
      },
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-02-28T15:45:00Z',
      approved_at: '2024-03-01T10:00:00Z',
      published_at: '2024-03-02T08:00:00Z',
      download_count: 567,
      view_count: 1890,
      requires_signature: true,
      requires_acknowledgment: true,
      tags: ['Ethics', 'Compliance', 'Conduct', 'Legal'],
      effective_date: '2024-03-15',
      expiry_date: '2025-03-15',
      next_review_date: '2024-12-01'
    },
    {
      id: 4,
      title: 'Safety Procedures Manual',
      description: 'Comprehensive safety guidelines and emergency procedures for workplace safety.',
      document_type: 'manual',
      category: 'Safety',
      file_name: 'safety-procedures-manual.pdf',
      file_size: 3072000,
      mime_type: 'application/pdf',
      version: '4.2',
      status: 'draft',
      priority: 'high',
      confidentiality_level: 'internal',
      owner: {
        first_name: 'David',
        last_name: 'Chen',
        email: 'david.chen@company.com'
      },
      created_at: '2024-03-01T14:00:00Z',
      updated_at: '2024-03-16T11:30:00Z',
      download_count: 12,
      view_count: 45,
      requires_signature: false,
      requires_acknowledgment: true,
      tags: ['Safety', 'Emergency', 'Procedures', 'Health'],
      effective_date: '2024-04-15',
      next_review_date: '2024-10-01'
    }
  ];

  const mockCategories = [
    {
      id: 1,
      name: 'HR Policies',
      description: 'Human resources policies and procedures',
      document_count: 24,
      icon: 'Users',
      color: '#3B82F6'
    },
    {
      id: 2,
      name: 'Work Policies',
      description: 'Work arrangements and operational policies',
      document_count: 18,
      icon: 'Briefcase',
      color: '#10B981'
    },
    {
      id: 3,
      name: 'Compliance',
      description: 'Legal and regulatory compliance documents',
      document_count: 15,
      icon: 'Shield',
      color: '#F59E0B'
    },
    {
      id: 4,
      name: 'Safety',
      description: 'Workplace safety and health procedures',
      document_count: 12,
      icon: 'AlertTriangle',
      color: '#EF4444'
    },
    {
      id: 5,
      name: 'Training',
      description: 'Training materials and educational resources',
      document_count: 31,
      icon: 'BookOpen',
      color: '#8B5CF6'
    },
    {
      id: 6,
      name: 'Templates',
      description: 'Document templates and forms',
      document_count: 22,
      icon: 'FileText',
      color: '#06B6D4'
    }
  ];

  const mockWorkflows = [
    {
      id: 1,
      name: 'Standard Document Approval',
      description: 'Standard approval workflow for internal documents',
      document_count: 45,
      status: 'active',
      steps: 3,
      avg_completion_time: '2.5 days'
    },
    {
      id: 2,
      name: 'Policy Review Workflow',
      description: 'Comprehensive review process for policy documents',
      document_count: 12,
      status: 'active',
      steps: 5,
      avg_completion_time: '5.2 days'
    },
    {
      id: 3,
      name: 'Compliance Approval',
      description: 'Legal and compliance review workflow',
      document_count: 8,
      status: 'active',
      steps: 4,
      avg_completion_time: '7.1 days'
    }
  ];

  const mockSignatures = [
    {
      id: 1,
      document_title: 'Remote Work Policy',
      signer_name: 'John Doe',
      status: 'pending',
      requested_at: '2024-03-15T10:00:00Z',
      due_date: '2024-03-22T23:59:59Z'
    },
    {
      id: 2,
      document_title: 'Code of Conduct',
      signer_name: 'Jane Smith',
      status: 'signed',
      requested_at: '2024-03-10T14:30:00Z',
      signed_at: '2024-03-12T09:15:00Z'
    },
    {
      id: 3,
      document_title: 'NDA Agreement',
      signer_name: 'Bob Johnson',
      status: 'declined',
      requested_at: '2024-03-08T11:00:00Z',
      declined_at: '2024-03-09T16:30:00Z'
    }
  ];

  useEffect(() => {
    loadDocuments();
    loadCategories();
    loadWorkflows();
    loadSignatures();
  }, []);

  // Reload documents when search/filter parameters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDocuments();
    }, 300); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await hrDocumentService.getHRDocuments({
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus
      });
      setDocuments(response.data.documents || mockDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments(mockDocuments);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await hrDocumentService.getHRDocumentCategories();
      setCategories(response.data.categories || mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(mockCategories);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await hrDocumentService.getHRDocumentWorkflows();
      setWorkflows(response.data.workflows || mockWorkflows);
    } catch (error) {
      console.error('Error loading workflows:', error);
      setWorkflows(mockWorkflows);
    }
  };

  const loadSignatures = async () => {
    try {
      const response = await hrDocumentService.getHRDocumentSignatures();
      setSignatures(response.data.signatures || mockSignatures);
    } catch (error) {
      console.error('Error loading signatures:', error);
      setSignatures(mockSignatures);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('image')) return <Image className="h-5 w-5 text-green-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    if (mimeType.includes('video')) return <FileVideo className="h-5 w-5 text-purple-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="h-5 w-5 text-primary" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'pending_approval': 'bg-orange-100 text-orange-800',
      'approved': 'bg-blue-100 text-blue-800',
      'published': 'bg-green-100 text-green-800',
      'archived': 'bg-gray-100 text-gray-600',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getConfidentialityColor = (level) => {
    const colors = {
      'public': 'bg-green-100 text-green-800',
      'internal': 'bg-blue-100 text-blue-800',
      'confidential': 'bg-orange-100 text-orange-800',
      'restricted': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Document operations
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUploadDocument = async (formData) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await hrDocumentService.createHRDocument(formData);
      
      if (response.data.success) {
        setShowUploadDialog(false);
        setSelectedFile(null);
        loadDocuments(); // Refresh the document list
        // Show success message
        toast.success('Document uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await hrDocumentService.deleteHRDocument(documentId);
        if (response.data.success) {
          loadDocuments(); // Refresh the document list
          toast.success('Document deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document. Please try again.');
      }
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const response = await hrDocumentService.downloadHRDocument(documentId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document. Please try again.');
    }
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      const response = await hrDocumentService.createHRDocumentCategory(categoryData);
      if (response.data.success) {
        setShowCategoryDialog(false);
        loadCategories(); // Refresh the categories list
        toast.success('Category created successfully!');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category. Please try again.');
    }
  };

  const handleCreateWorkflow = async (workflowData) => {
    try {
      const response = await hrDocumentService.createHRDocumentWorkflow(workflowData);
      if (response.data.success) {
        setShowWorkflowDialog(false);
        loadWorkflows(); // Refresh the workflows list
        toast.success('Workflow created successfully!');
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow. Please try again.');
    }
  };

  const handleCreateSignatureRequest = async (signatureData) => {
    try {
      const response = await hrDocumentService.createHRDocumentSignatureRequest(signatureData);
      if (response.data.success) {
        setShowSignatureDialog(false);
        loadSignatures(); // Refresh the signatures list
        toast.success('Signature request created successfully!');
      }
    } catch (error) {
      console.error('Error creating signature request:', error);
      toast.error('Failed to create signature request. Please try again.');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const renderDocuments = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Document Library</h2>
          <p className="text-muted-foreground">Manage and organize your documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCategoryDialog(true)}>
            <Folder className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
  value={selectedCategory} 
  onChange={(e) => setSelectedCategory(e.target.value)}
  className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  <option value="all">All Categories</option>
  {categories.map(category => (
    <option key={category.id} value={category.name}>{category.name}</option>
  ))}
</select>
        <select 
  value={selectedStatus} 
  onChange={(e) => setSelectedStatus(e.target.value)}
  className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  <option value="all">All Statuses</option>
  <option value="draft">Draft</option>
  <option value="under_review">Under Review</option>
  <option value="published">Published</option>
  <option value="archived">Archived</option>
</select>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
          <CardDescription>All documents in your library</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getFileIcon(doc.mime_type)}
                      <div>
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-muted-foreground">
                          v{doc.version} • {formatFileSize(doc.file_size)}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {doc.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {doc.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{doc.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(doc.priority)}>
                      {doc.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {doc.owner.first_name} {doc.owner.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {doc.owner.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(doc.updated_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedDocument(doc)}
                        title="View Document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadDocument(doc.id, doc.file_name)}
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedDocument(doc);
                          // TODO: Open edit dialog
                        }}
                        title="Edit Document"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete Document"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Document Categories</h2>
          <p className="text-muted-foreground">Organize documents by category</p>
        </div>
        <Button onClick={() => setShowCategoryDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <Folder className="h-5 w-5" style={{ color: category.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.document_count} documents</CardDescription>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderWorkflows = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Document Workflows</h2>
          <p className="text-muted-foreground">Manage approval and review workflows</p>
        </div>
        <Button onClick={() => setShowWorkflowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{workflow.name}</CardTitle>
                  <CardDescription>{workflow.description}</CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {workflow.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Documents</div>
                    <div className="text-muted-foreground">{workflow.document_count}</div>
                  </div>
                  <div>
                    <div className="font-medium">Steps</div>
                    <div className="text-muted-foreground">{workflow.steps}</div>
                  </div>
                  <div>
                    <div className="font-medium">Avg. Time</div>
                    <div className="text-muted-foreground">{workflow.avg_completion_time}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSignatures = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Digital Signatures</h2>
          <p className="text-muted-foreground">Manage signature requests and approvals</p>
        </div>
        <Button onClick={() => setShowSignatureDialog(true)}>
          <PenTool className="h-4 w-4 mr-2" />
          Request Signature
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signature Requests</CardTitle>
          <CardDescription>Recent signature requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Signer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signatures.map((signature) => (
                <TableRow key={signature.id}>
                  <TableCell>
                    <div className="font-medium">{signature.document_title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{signature.signer_name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      signature.status === 'signed' ? 'bg-green-100 text-green-800' :
                      signature.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {signature.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(signature.requested_at)}</TableCell>
                  <TableCell>
                    {signature.due_date ? formatDate(signature.due_date) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {signature.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Document Analytics</h2>
        <p className="text-muted-foreground">Insights and statistics about document usage</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              5 pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signatures</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              3 pending signatures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts would go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Types</CardTitle>
            <CardDescription>Distribution of document types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Policies</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Handbooks</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">30%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Procedures</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">25%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest document activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Employee Handbook updated</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">New policy document uploaded</div>
                  <div className="text-xs text-muted-foreground">4 hours ago</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Signature request sent</div>
                  <div className="text-xs text-muted-foreground">6 hours ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Management System</h1>
          <p className="text-muted-foreground">
            Comprehensive document and policy management with workflows, signatures, and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          {renderDocuments()}
        </TabsContent>

        <TabsContent value="categories">
          {renderCategories()}
        </TabsContent>

        <TabsContent value="workflows">
          {renderWorkflows()}
        </TabsContent>

        <TabsContent value="signatures">
          {renderSignatures()}
        </TabsContent>

        <TabsContent value="analytics">
          {renderAnalytics()}
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Document Title</Label>
              <Input id="title" placeholder="Enter document title" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter document description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select 
                  name="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="type">Document Type</Label>
                <select 
                  name="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select type</option>
                  <option value="policy">Policy</option>
                  <option value="procedure">Procedure</option>
                  <option value="handbook">Handbook</option>
                  <option value="form">Form</option>
                  <option value="template">Template</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select 
                  name="priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <Label htmlFor="confidentiality">Confidentiality</Label>
                <select 
                  name="confidentiality"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select confidentiality</option>
                  <option value="public">Public</option>
                  <option value="internal">Internal</option>
                  <option value="confidential">Confidential</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
            </div>
            <div>
              <Label>File Upload</Label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-green-600 font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {hrDocumentService.formatFileSize(selectedFile.size)}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
                    <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (Max 50MB)</p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileSelect}
                    />
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
            <div>
              <Label>Options</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="signature" />
                  <Label htmlFor="signature">Requires digital signature</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="acknowledgment" />
                  <Label htmlFor="acknowledgment">Requires acknowledgment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="workflow" />
                  <Label htmlFor="workflow">Start approval workflow</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUploadDialog(false);
                  setSelectedFile(null);
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                onClick={async (e) => {
                  e.preventDefault();
                  
                  if (!selectedFile) {
                    toast.warning('Please select a file to upload');
                    return;
                  }
                  
                  const form = e.target.closest('form') || e.target.closest('.space-y-4');
                  const formData = new FormData();
                  
                  // Get form values
                  const title = form.querySelector('#title')?.value || selectedFile.name;
                  const description = form.querySelector('#description')?.value || '';
                  const category = form.querySelector('[name="category"]')?.value || categories[0]?.name;
                  const documentType = form.querySelector('[name="type"]')?.value || 'policy';
                  const priority = form.querySelector('[name="priority"]')?.value || 'medium';
                  const confidentiality = form.querySelector('[name="confidentiality"]')?.value || 'internal';
                  const requiresSignature = form.querySelector('#signature')?.checked || false;
                  const requiresAcknowledgment = form.querySelector('#acknowledgment')?.checked || false;
                  const startWorkflow = form.querySelector('#workflow')?.checked || false;
                  
                  // Append form data
                  formData.append('file', selectedFile);
                  formData.append('title', title);
                  formData.append('description', description);
                  formData.append('category', category);
                  formData.append('document_type', documentType);
                  formData.append('priority', priority);
                  formData.append('confidentiality_level', confidentiality);
                  formData.append('requires_signature', requiresSignature);
                  formData.append('requires_acknowledgment', requiresAcknowledgment);
                  formData.append('tags', JSON.stringify([documentType, category]));
                  
                  await handleUploadDocument(formData);
                }}
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Document Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input id="category-name" placeholder="Enter category name" />
            </div>
            <div>
              <Label htmlFor="category-description">Description</Label>
              <Textarea id="category-description" placeholder="Enter category description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category-icon">Icon</Label>
                <select 
                  name="icon"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select icon</option>
                  <option value="FileText">FileText</option>
                  <option value="Users">Users</option>
                  <option value="Shield">Shield</option>
                  <option value="AlertTriangle">AlertTriangle</option>
                  <option value="Folder">Folder</option>
                </select>
              </div>
              <div>
                <Label htmlFor="category-color">Color</Label>
                <Input id="category-color" type="color" defaultValue="#3B82F6" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={async (e) => {
                const form = e.target.closest('.space-y-4');
                const categoryData = {
                  name: form.querySelector('#category-name').value,
                  description: form.querySelector('#category-description').value,
                  icon: form.querySelector('[name="icon"]')?.value || 'FileText',
                  color: form.querySelector('#category-color').value,
                  sort_order: categories.length + 1
                };
                await handleCreateCategory(categoryData);
              }}>
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Workflow Dialog */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Document Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input id="workflow-name" placeholder="Enter workflow name" />
            </div>
            <div>
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea id="workflow-description" placeholder="Enter workflow description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workflow-type">Workflow Type</Label>
                <select 
                  name="workflow-type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select type</option>
                  <option value="approval">Approval</option>
                  <option value="review">Review</option>
                  <option value="signature">Signature</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <Label htmlFor="workflow-priority">Priority</Label>
                <select 
                  name="workflow-priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="workflow-sla">SLA Hours</Label>
              <Input id="workflow-sla" type="number" placeholder="Enter SLA in hours" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={async (e) => {
                const form = e.target.closest('.space-y-4');
                const workflowData = {
                  name: form.querySelector('#workflow-name').value,
                  description: form.querySelector('#workflow-description').value,
                  workflow_type: form.querySelector('[name="workflow-type"]')?.value || 'approval',
                  priority: form.querySelector('[name="workflow-priority"]')?.value || 'medium',
                  sla_hours: parseInt(form.querySelector('#workflow-sla').value) || 24,
                  steps: [
                    {
                      name: 'Initial Review',
                      type: 'approval',
                      order: 1,
                      required: true
                    }
                  ]
                };
                await handleCreateWorkflow(workflowData);
              }}>
                Create Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Signature Request Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Document Signature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="signature-document">Document</Label>
              <select 
                name="signature-document"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select document</option>
                {documents.map(doc => (
                  <option key={doc.id} value={doc.id.toString()}>
                    {doc.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="signature-signer">Signer Email</Label>
              <Input id="signature-signer" type="email" placeholder="Enter signer email" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="signature-type">Signature Type</Label>
                <select 
                  name="signature-type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select type</option>
                  <option value="digital">Digital</option>
                  <option value="electronic">Electronic</option>
                </select>
              </div>
              <div>
                <Label htmlFor="signature-due">Due Date</Label>
                <Input id="signature-due" type="date" />
              </div>
            </div>
            <div>
              <Label htmlFor="signature-comments">Comments</Label>
              <Textarea id="signature-comments" placeholder="Enter any comments or instructions" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>
                Cancel
              </Button>
              <Button onClick={async (e) => {
                const form = e.target.closest('.space-y-4');
                const signatureData = {
                  document_id: parseInt(form.querySelector('[name="signature-document"]')?.value),
                  signer_email: form.querySelector('#signature-signer').value,
                  signature_type: form.querySelector('[name="signature-type"]')?.value || 'digital',
                  due_date: form.querySelector('#signature-due').value,
                  comments: form.querySelector('#signature-comments').value
                };
                await handleCreateSignatureRequest(signatureData);
              }}>
                Send Signature Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManagementSystem;