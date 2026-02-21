import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea, Content, Item, Trigger, Value,
  Badge,
  Separator
} from '@/components/ui';
import { 
  Save, 
  Eye, 
  Send, 
  FileText, 
  Calendar, 
  User, 
  Building,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const PolicyEditor = ({ policy, onSave, onPreview, onSubmitForApproval }) => {
  const [formData, setFormData] = useState({
    title: policy?.title || '',
    description: policy?.description || '',
    policy_type: policy?.policy_type || 'general',
    department: policy?.department || '',
    effective_date: policy?.effective_date || '',
    review_date: policy?.review_date || '',
    content: policy?.content || '',
    approval_required: policy?.approval_required || true,
    tags: policy?.tags || '',
    priority: policy?.priority || 'medium',
    confidentiality_level: policy?.confidentiality_level || 'internal'
  });

  const [activeSection, setActiveSection] = useState('basic');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handlePreview = () => {
    onPreview(formData);
  };

  const handleSubmitForApproval = () => {
    onSubmitForApproval(formData);
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Policy Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter policy title"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of the policy"
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="policy_type">Policy Type</Label>
          <select value={formData.policy_type} 
            onChange={(e) => (value) => handleInputChange('policy_type', value)(e.target.value)}
          >
            
              
            
            
              <option value="general">General</option>
              <option value="hr">Human Resources</option>
              <option value="security">Security</option>
              <option value="finance">Finance</option>
              <option value="it">Information Technology</option>
              <option value="compliance">Compliance</option>
              <option value="safety">Safety</option>
              <option value="quality">Quality</option>
            
          </select>
        </div>

        <div>
          <Label htmlFor="department">Responsible Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            placeholder="e.g., Human Resources"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority</Label>
          <select value={formData.priority} 
            onChange={(e) => (value) => handleInputChange('priority', value)(e.target.value)}
          >
            
              
            
            
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            
          </select>
        </div>

        <div>
          <Label htmlFor="confidentiality_level">Confidentiality Level</Label>
          <select value={formData.confidentiality_level} 
            onChange={(e) => (value) => handleInputChange('confidentiality_level', value)(e.target.value)}
          >
            
              
            
            
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
              <option value="restricted">Restricted</option>
            
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => handleInputChange('tags', e.target.value)}
          placeholder="Enter tags separated by commas"
          className="mt-1"
        />
      </div>
    </div>
  );

  const renderDatesAndApproval = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="effective_date">Effective Date</Label>
          <Input
            id="effective_date"
            type="date"
            value={formData.effective_date}
            onChange={(e) => handleInputChange('effective_date', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="review_date">Next Review Date</Label>
          <Input
            id="review_date"
            type="date"
            value={formData.review_date}
            onChange={(e) => handleInputChange('review_date', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="approval_required"
          checked={formData.approval_required}
          onChange={(e) => handleInputChange('approval_required', e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="approval_required">Requires Approval Before Publication</Label>
      </div>

      {formData.approval_required && (
        <div className="bg-primary-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-blue-800">Approval Workflow</span>
          </div>
          <p className="text-sm text-primary-700">
            This policy will be submitted for approval according to your organization's approval workflow.
            You will be notified when the approval process is complete.
          </p>
        </div>
      )}
    </div>
  );

  const renderContent = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="content">Policy Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          placeholder="Enter the full policy content..."
          rows={15}
          className="mt-1 font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          You can use Markdown formatting for better presentation.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Content Guidelines:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Start with a clear purpose statement</li>
          <li>• Include scope and applicability</li>
          <li>• Define key terms and responsibilities</li>
          <li>• Provide specific procedures and guidelines</li>
          <li>• Include compliance and enforcement measures</li>
          <li>• Add contact information for questions</li>
        </ul>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="border rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{formData.title || 'Policy Title'}</h2>
            <p className="text-muted-foreground">{formData.description}</p>
          </div>
          <div className="text-right space-y-1">
            <Badge className="bg-blue-100 text-blue-800">
              {formData.policy_type}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {formData.department}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Effective: {formData.effective_date || 'Not set'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Review: {formData.review_date || 'Not set'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>Priority: {formData.priority}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Confidentiality: {formData.confidentiality_level}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap">
            {formData.content || 'Policy content will appear here...'}
          </div>
        </div>

        {formData.tags && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Tags:</span>
              {formData.tags.split(',').map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {policy ? 'Edit Policy' : 'Create New Policy'}
          </h2>
          <p className="text-muted-foreground">
            {policy ? 'Make changes to your policy' : 'Create a comprehensive policy document'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleSubmitForApproval}>
            <Send className="h-4 w-4 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Information', icon: FileText },
            { id: 'dates', label: 'Dates & Approval', icon: Calendar },
            { id: 'content', label: 'Content', icon: FileText },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeSection === tab.id
                  ? 'border-blue-500 text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {activeSection === 'basic' && renderBasicInfo()}
          {activeSection === 'dates' && renderDatesAndApproval()}
          {activeSection === 'content' && renderContent()}
          {activeSection === 'preview' && renderPreview()}
        </CardContent>
      </Card>

      {/* Status Information */}
      {policy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Policy Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${
                  policy.status === 'published' ? 'bg-green-500' :
                  policy.status === 'pending_approval' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <span className="text-sm">Status: {policy.status}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Created: {new Date(policy.created_at).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Last Modified: {new Date(policy.updated_at || policy.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyEditor;