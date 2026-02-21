/**
 * ProjectTemplates Component - Template Library
 * 
 * Displays a library of project templates organized by category.
 * Users can preview templates and create new projects from them.
 * 
 * Features:
 * - Template library with categories
 * - Template preview modal
 * - Create project from template
 * - Responsive card grid
 * 
 * Requirements: 4.1
 */

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  FileText,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  ArrowLeft,
  Copy,
} from "lucide-react";
import Button from '@/design-system/components/Button';
import FormField from '@/design-system/components/FormField';
import Badge from '@/design-system/components/Badge';
import Card from '@/design-system/components/Card';
import Modal from '@/design-system/components/Modal';
import toast from 'react-hot-toast';

// Mock template data
const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates' },
  { id: 'software', name: 'Software Development' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'construction', name: 'Construction' },
  { id: 'event', name: 'Event Planning' },
  { id: 'research', name: 'Research' },
];

const MOCK_TEMPLATES = [
  {
    id: 1,
    name: 'Website Development',
    category: 'software',
    description: 'Complete website development project with design, development, and deployment phases.',
    duration: '3 months',
    teamSize: 5,
    estimatedBudget: 50000,
    tasks: 45,
    milestones: ['Requirements', 'Design', 'Development', 'Testing', 'Deployment'],
    tags: ['Web', 'Frontend', 'Backend'],
  },
  {
    id: 2,
    name: 'Mobile App Development',
    category: 'software',
    description: 'Cross-platform mobile application development with React Native.',
    duration: '4 months',
    teamSize: 6,
    estimatedBudget: 75000,
    tasks: 60,
    milestones: ['Planning', 'UI/UX Design', 'Development', 'Testing', 'Launch'],
    tags: ['Mobile', 'iOS', 'Android'],
  },
  {
    id: 3,
    name: 'Product Launch Campaign',
    category: 'marketing',
    description: 'Comprehensive marketing campaign for new product launch.',
    duration: '2 months',
    teamSize: 4,
    estimatedBudget: 30000,
    tasks: 35,
    milestones: ['Strategy', 'Content Creation', 'Campaign Launch', 'Analysis'],
    tags: ['Marketing', 'Social Media', 'Content'],
  },
  {
    id: 4,
    name: 'Brand Identity Design',
    category: 'marketing',
    description: 'Complete brand identity package including logo, colors, and guidelines.',
    duration: '6 weeks',
    teamSize: 3,
    estimatedBudget: 15000,
    tasks: 20,
    milestones: ['Discovery', 'Concepts', 'Refinement', 'Delivery'],
    tags: ['Branding', 'Design', 'Identity'],
  },
  {
    id: 5,
    name: 'Office Building Construction',
    category: 'construction',
    description: 'Commercial office building construction project.',
    duration: '12 months',
    teamSize: 20,
    estimatedBudget: 2000000,
    tasks: 150,
    milestones: ['Planning', 'Foundation', 'Structure', 'Interior', 'Completion'],
    tags: ['Construction', 'Commercial', 'Building'],
  },
  {
    id: 6,
    name: 'Home Renovation',
    category: 'construction',
    description: 'Residential home renovation and remodeling project.',
    duration: '3 months',
    teamSize: 8,
    estimatedBudget: 100000,
    tasks: 50,
    milestones: ['Assessment', 'Demolition', 'Construction', 'Finishing'],
    tags: ['Renovation', 'Residential', 'Remodeling'],
  },
  {
    id: 7,
    name: 'Corporate Conference',
    category: 'event',
    description: 'Large-scale corporate conference with 500+ attendees.',
    duration: '4 months',
    teamSize: 10,
    estimatedBudget: 150000,
    tasks: 80,
    milestones: ['Planning', 'Venue', 'Marketing', 'Execution', 'Follow-up'],
    tags: ['Conference', 'Corporate', 'Event'],
  },
  {
    id: 8,
    name: 'Product Launch Event',
    category: 'event',
    description: 'Exclusive product launch event for VIP customers.',
    duration: '6 weeks',
    teamSize: 6,
    estimatedBudget: 50000,
    tasks: 40,
    milestones: ['Concept', 'Planning', 'Setup', 'Event Day', 'Wrap-up'],
    tags: ['Launch', 'Product', 'VIP'],
  },
  {
    id: 9,
    name: 'Market Research Study',
    category: 'research',
    description: 'Comprehensive market research and analysis project.',
    duration: '3 months',
    teamSize: 5,
    estimatedBudget: 40000,
    tasks: 30,
    milestones: ['Design', 'Data Collection', 'Analysis', 'Reporting'],
    tags: ['Research', 'Market', 'Analysis'],
  },
  {
    id: 10,
    name: 'User Experience Research',
    category: 'research',
    description: 'In-depth user experience research and usability testing.',
    duration: '2 months',
    teamSize: 4,
    estimatedBudget: 25000,
    tasks: 25,
    milestones: ['Planning', 'Recruitment', 'Testing', 'Analysis', 'Report'],
    tags: ['UX', 'Research', 'Usability'],
  },
];

const ProjectTemplates = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return MOCK_TEMPLATES.filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Handle template preview
  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  // Handle create from template
  const handleCreateFromTemplate = (template) => {
    toast.success(`Creating project from "${template.name}" template...`);
    // In a real app, this would navigate to project creation with template data
    navigate('/projects/new', { state: { template } });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
              className="min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Project Templates</h1>
          </div>
          <p className="text-sm md:text-base text-neutral-600">
            Choose from pre-built templates to quickly start your project
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/projects/new')}
          className="min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Blank Project
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <FormField
                type="text"
                placeholder="Search templates by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} hoverable className="flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              {/* Template Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {template.description}
                </p>
              </div>

              {/* Template Stats */}
              <div className="space-y-3 mb-4 flex-1">
                <div className="flex items-center text-sm text-neutral-600">
                  <Calendar className="h-4 w-4 mr-2 text-neutral-400" />
                  <span>Duration: {template.duration}</span>
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <Users className="h-4 w-4 mr-2 text-neutral-400" />
                  <span>Team Size: {template.teamSize} members</span>
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <DollarSign className="h-4 w-4 mr-2 text-neutral-400" />
                  <span>Est. Budget: {formatCurrency(template.estimatedBudget)}</span>
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <FileText className="h-4 w-4 mr-2 text-neutral-400" />
                  <span>{template.tasks} tasks included</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {template.tags.map(tag => (
                  <Badge key={tag} variant="default" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(template)}
                  className="flex-1 min-h-[44px]"
                >
                  Preview
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCreateFromTemplate(template)}
                  className="flex-1 min-h-[44px]"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No templates found
            </h3>
            <p className="text-neutral-600 mb-4">
              Try adjusting your search or category filter
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <Modal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          title={selectedTemplate.name}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleCreateFromTemplate(selectedTemplate);
                  setShowPreview(false);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Description</h4>
              <p className="text-neutral-600">{selectedTemplate.description}</p>
            </div>

            {/* Project Details */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Project Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-neutral-400" />
                  <div>
                    <div className="text-neutral-500">Duration</div>
                    <div className="font-medium">{selectedTemplate.duration}</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-neutral-400" />
                  <div>
                    <div className="text-neutral-500">Team Size</div>
                    <div className="font-medium">{selectedTemplate.teamSize} members</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-neutral-400" />
                  <div>
                    <div className="text-neutral-500">Estimated Budget</div>
                    <div className="font-medium">{formatCurrency(selectedTemplate.estimatedBudget)}</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 mr-2 text-neutral-400" />
                  <div>
                    <div className="text-neutral-500">Tasks</div>
                    <div className="font-medium">{selectedTemplate.tasks} tasks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Milestones</h4>
              <div className="space-y-2">
                {selectedTemplate.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-success-500" />
                    <span>{milestone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.tags.map(tag => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectTemplates;
