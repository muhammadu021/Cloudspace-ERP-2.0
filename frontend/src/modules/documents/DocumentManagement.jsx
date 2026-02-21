import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  FolderOpen,
  Clock,
  Users,
  Shield,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  BookOpen,
  FileCheck,
  PenTool,
  MessageSquare,
  Share2,
  Archive,
  Star,
  Calendar,
  Tag,
  Globe,
  Lock,
  UserCheck,
  Package
} from 'lucide-react';

// Create a Signature component since it's not available in lucide-react
const Signature = ({ className, ...props }) => (
  <PenTool className={className} {...props} />
);
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Textarea,
  
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui';
import { toast } from 'react-hot-toast';
import documentService from '@/services/documentService';

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  // Dialog states
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Form states
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    document_type: 'other',
    category_id: '',
    confidentiality_level: 'internal',
    priority: 'medium',
    effective_date: '',
    expiry_date: '',
    requires_signature: false,
    requires_acknowledgment: false,
    tags: ''
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parent_id: '',
    icon: 'folder',
    color: '#3B82F6',
    access_level: 'internal',
    requires_approval: true
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [searchTerm, selectedCategory, selectedStatus, selectedType]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, statsRes] = await Promise.all([
        documentService.getCategories(),
        documentService.getStatistics()
      ]);
      setCategories(categoriesRes.data.categories || []);
      setStatistics(statsRes.data || {});
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedType) params.document_type = selectedType;
      
      const response = await documentService.getDocuments(params);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      Object.keys(uploadForm).forEach(key => {
        if (uploadForm[key] !== '') {
          formData.append(key, uploadForm[key]);
        }
      });

      await documentService.createDocument(formData);
      toast.success('Document uploaded successfully');
      setShowUploadDialog(false);
      setSelectedFile(null);
      setUploadForm({
        title: '',
        description: '',
        document_type: 'other',
        category_id: '',
        confidentiality_level: 'internal',
        priority: 'medium',
        effective_date: '',
        expiry_date: '',
        requires_signature: false,
        requires_acknowledgment: false,
        tags: ''
      });
      loadDocuments();
      loadInitialData();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await documentService.createCategory(categoryForm);
      toast.success('Category created successfully');
      setShowCategoryDialog(false);
      setCategoryForm({
        name: '',
        description: '',
        parent_id: '',
        icon: 'folder',
        color: '#3B82F6',
        access_level: 'internal',
        requires_approval: true
      });
      loadInitialData();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await documentService.downloadDocument(document.id);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: document.mime_type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleView = (document) => {
    setSelectedDocument(document);
    setShowViewDialog(true);
  };

  const handleDelete = async (document) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(document.id);
        toast.success('Document deleted successfully');
        loadDocuments();
        loadInitialData();
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setShowUploadDialog(true);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.publishedDocuments || 0} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.pendingApproval || 0}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.draftDocuments || 0} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalDownloads || 0}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.totalViews || 0} views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signatures Required</CardTitle>
            <Signature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.documentsRequiringSignature || 0}</div>
            <p className="text-xs text-muted-foreground">Active documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common document management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => setShowUploadDialog(true)} className="h-20 flex flex-col">
              <Upload className="h-6 w-6 mb-2" />
              Upload Document
            </Button>
            <Button onClick={() => setShowCategoryDialog(true)} className="h-20 flex flex-col" variant="outline">
              <FolderOpen className="h-6 w-6 mb-2" />
              Create Category
            </Button>
            <Button onClick={() => setActiveTab('library')} className="h-20 flex flex-col" variant="outline">
              <Search className="h-6 w-6 mb-2" />
              Browse Library
            </Button>
            <Button onClick={() => setActiveTab('analytics')} className="h-20 flex flex-col" variant="outline">
              <BarChart3 className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.slice(0, 5).map((document) => (
              <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {documentService.getMimeTypeIcon(document.mime_type)}
                  </div>
                  <div>
                    <p className="font-medium">{document.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {document.category?.name} • {documentService.formatFileSize(document.file_size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={documentService.getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => handleView(document)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLibrary = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Document Library</h2>
          <p className="text-muted-foreground">Browse and manage all documents</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
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
  <option value="">All Categories</option>
  {categories.map((category) => (
    <option key={category.id} value={category.id.toString()}>
      {category.name}
    </option>
  ))}
</select>
        <select 
  value={selectedStatus} 
  onChange={(e) => setSelectedStatus(e.target.value)}
  className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  <option value="">All Status</option>
  <option value="draft">Draft</option>
  <option value="pending_approval">Pending Approval</option>
  <option value="published">Published</option>
  <option value="archived">Archived</option>
</select>
        <select 
  value={selectedType} 
  onChange={(e) => setSelectedType(e.target.value)}
  className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  <option value="">All Types</option>
  <option value="policy">Policy</option>
  <option value="handbook">Handbook</option>
  <option value="form">Form</option>
  <option value="compliance">Compliance</option>
  <option value="training">Training</option>
</select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => (
          <Card key={document.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {documentService.getMimeTypeIcon(document.mime_type)}
                  </span>
                  <div>
                    <CardTitle className="text-lg">{document.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{document.category?.name}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleView(document)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(document)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(document)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {document.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <span>{documentService.formatFileSize(document.file_size)}</span>
                  <span>{documentService.formatDate(document.created_at)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={documentService.getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                  <Badge className={documentService.getPriorityColor(document.priority)}>
                    {document.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{document.view_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>{document.download_count}</span>
                  </div>
                  {document.requires_signature && (
                    <Signature className="h-4 w-4 text-orange-500" title="Requires Signature" />
                  )}
                  {document.requires_acknowledgment && (
                    <CheckCircle className="h-4 w-4 text-primary" title="Requires Acknowledgment" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search criteria or upload a new document</p>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div 
      className="p-6 space-y-6"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Comprehensive document and policy management system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="handbook">Handbook</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="library">
          {renderLibrary()}
        </TabsContent>

        <TabsContent value="policies">
          <div className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Policy Management</h3>
            <p className="text-muted-foreground mb-4">Create and manage company policies</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="handbook">
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Employee Handbook</h3>
            <p className="text-muted-foreground mb-4">Manage employee handbook and guidelines</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="text-center py-12">
            <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Compliance Documentation</h3>
            <p className="text-muted-foreground mb-4">Manage compliance and regulatory documents</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Compliance Doc
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="workflows">
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Approval Workflows</h3>
            <p className="text-muted-foreground mb-4">Configure document approval processes</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="signatures">
          <div className="text-center py-12">
            <Signature className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Digital Signatures</h3>
            <p className="text-muted-foreground mb-4">Manage digital signature requests</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Signature
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Document Analytics</h3>
            <p className="text-muted-foreground mb-4">View document usage and insights</p>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFileUpload} className="space-y-4">
            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-primary-50' : 'border-gray-300'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 mx-auto text-green-600" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {documentService.formatFileSize(selectedFile.size)}
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-lg font-medium">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, Word, Excel, PowerPoint, and image files
                  </p>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Document Title *</Label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="document_type">Document Type *</Label>
                <select 
  value={uploadForm.document_type} 
  onChange={(e) => setUploadForm(prev => ({ ...prev, document_type: e.target.value }))}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  <option value="policy">Policy</option>
  <option value="procedure">Procedure</option>
  <option value="handbook">Handbook</option>
  <option value="form">Form</option>
  <option value="template">Template</option>
  <option value="contract">Contract</option>
  <option value="compliance">Compliance</option>
  <option value="training">Training</option>
  <option value="manual">Manual</option>
  <option value="report">Report</option>
  <option value="other">Other</option>
</select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter document description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category_id">Category</Label>
                <select 
  value={uploadForm.category_id} 
  onChange={(e) => setUploadForm(prev => ({ ...prev, category_id: e.target.value }))}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  <option value="">Select category</option>
  {categories.map((category) => (
    <option key={category.id} value={category.id.toString()}>
      {category.name}
    </option>
  ))}
</select>
              </div>
              <div>
                <Label htmlFor="confidentiality_level">Confidentiality Level</Label>
                <select 
  value={uploadForm.confidentiality_level} 
  onChange={(e) => setUploadForm(prev => ({ ...prev, confidentiality_level: e.target.value }))}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  <option value="public">Public</option>
  <option value="internal">Internal</option>
  <option value="confidential">Confidential</option>
  <option value="restricted">Restricted</option>
</select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select 
  value={uploadForm.priority} 
  onChange={(e) => setUploadForm(prev => ({ ...prev, priority: e.target.value }))}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
  <option value="critical">Critical</option>
</select>
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input
                  type="date"
                  value={uploadForm.effective_date}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, effective_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  type="date"
                  value={uploadForm.expiry_date}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requires_signature"
                  checked={uploadForm.requires_signature}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, requires_signature: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="requires_signature">Requires Digital Signature</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requires_acknowledgment"
                  checked={uploadForm.requires_acknowledgment}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, requires_acknowledgment: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="requires_acknowledgment">Requires Acknowledgment</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !selectedFile}>
                {loading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Document Information</h3>
                  <div className="space-y-2">
                    <div><strong>Title:</strong> {selectedDocument.title}</div>
                    <div><strong>Type:</strong> {selectedDocument.document_type}</div>
                    <div><strong>Category:</strong> {selectedDocument.category?.name}</div>
                    <div><strong>File Size:</strong> {documentService.formatFileSize(selectedDocument.file_size)}</div>
                    <div><strong>Version:</strong> {selectedDocument.version}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Status & Access</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      <Badge className={documentService.getStatusColor(selectedDocument.status)}>
                        {selectedDocument.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Priority:</strong>
                      <Badge className={documentService.getPriorityColor(selectedDocument.priority)}>
                        {selectedDocument.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Confidentiality:</strong>
                      <Badge className={documentService.getConfidentialityColor(selectedDocument.confidentiality_level)}>
                        {selectedDocument.confidentiality_level}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedDocument.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedDocument.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Usage Statistics</h4>
                  <div className="space-y-1 text-sm">
                    <div>Views: {selectedDocument.view_count}</div>
                    <div>Downloads: {selectedDocument.download_count}</div>
                    <div>Created: {documentService.formatDate(selectedDocument.created_at)}</div>
                    <div>Updated: {documentService.formatDate(selectedDocument.updated_at)}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      {selectedDocument.requires_signature ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                      Digital Signature Required
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedDocument.requires_acknowledgment ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                      Acknowledgment Required
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleDownload(selectedDocument)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Input
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="folder"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="access_level">Access Level</Label>
              <select 
  value={categoryForm.access_level} 
  onChange={(e) => setCategoryForm(prev => ({ ...prev, access_level: e.target.value }))}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  <option value="public">Public</option>
  <option value="internal">Internal</option>
  <option value="restricted">Restricted</option>
</select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requires_approval"
                checked={categoryForm.requires_approval}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, requires_approval: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="requires_approval">Requires Approval</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCategoryDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Drag Overlay */}
      {dragActive && (
        <div className="fixed inset-0 bg-primary-500 bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
            <p className="text-lg font-semibold">Drop files here to upload</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;