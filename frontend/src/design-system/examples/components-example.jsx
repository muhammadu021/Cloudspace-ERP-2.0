/**
 * Core Components Usage Examples
 * 
 * Demonstrates usage of Button, FormField, and Card components
 * with various configurations and states.
 */

import React, { useState } from 'react';
import { Button, FormField, Card } from '../components';

export const ButtonExamples = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-8 p-6">
      <section>
        <h2 className="text-h2 mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </section>

      <section>
        <h2 className="text-h2 mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section>
        <h2 className="text-h2 mb-4">Button States</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={handleClick}>
            {loading ? 'Loading...' : 'Click to Load'}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-h2 mb-4">Button with Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            iconPosition="left"
          >
            Add Item
          </Button>
          <Button
            variant="secondary"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            }
            iconPosition="right"
          >
            Next
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-h2 mb-4">Full Width Button</h2>
        <Button fullWidth>Full Width Button</Button>
      </section>
    </div>
  );
};

export const FormFieldExamples = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    country: '',
    birthdate: '',
    newsletter: false,
    gender: '',
    notifications: true,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <h2 className="text-h2 mb-4">Form Field Examples</h2>

      <FormField
        type="text"
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange('name')}
        placeholder="Enter your full name"
        required
        helperText="Please enter your first and last name"
      />

      <FormField
        type="email"
        label="Email Address"
        name="email"
        value={formData.email}
        onChange={handleChange('email')}
        placeholder="you@example.com"
        required
        error={errors.email}
      />

      <FormField
        type="password"
        label="Password"
        name="password"
        value={formData.password}
        onChange={handleChange('password')}
        placeholder="Enter a secure password"
        required
        helperText="Must be at least 8 characters"
      />

      <FormField
        type="textarea"
        label="Bio"
        name="bio"
        value={formData.bio}
        onChange={handleChange('bio')}
        placeholder="Tell us about yourself"
        rows={4}
        helperText="Maximum 500 characters"
      />

      <FormField
        type="select"
        label="Country"
        name="country"
        value={formData.country}
        onChange={handleChange('country')}
        placeholder="Select your country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' },
        ]}
        required
      />

      <FormField
        type="date"
        label="Birth Date"
        name="birthdate"
        value={formData.birthdate}
        onChange={handleChange('birthdate')}
      />

      <FormField
        type="checkbox"
        label="Subscribe to newsletter"
        name="newsletter"
        value={formData.newsletter}
        onChange={handleChange('newsletter')}
      />

      <FormField
        type="radio"
        label="Gender"
        name="gender"
        value={formData.gender}
        onChange={handleChange('gender')}
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
          { value: 'prefer-not-to-say', label: 'Prefer not to say' },
        ]}
      />

      <FormField
        type="switch"
        label="Enable notifications"
        name="notifications"
        value={formData.notifications}
        onChange={handleChange('notifications')}
        helperText="Receive email notifications about updates"
      />

      <div className="pt-4">
        <Button type="submit" fullWidth>
          Submit Form
        </Button>
      </div>
    </div>
  );
};

export const CardExamples = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-h2 mb-4">Card Examples</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Card */}
        <Card>
          <p className="text-body">
            This is a basic card with default padding and no header or footer.
          </p>
        </Card>

        {/* Card with Title */}
        <Card title="Card Title">
          <p className="text-body">
            This card has a title in the header section.
          </p>
        </Card>

        {/* Card with Title and Subtitle */}
        <Card
          title="Project Overview"
          subtitle="Last updated 2 hours ago"
        >
          <div className="space-y-2">
            <p className="text-body-sm">Status: In Progress</p>
            <p className="text-body-sm">Completion: 75%</p>
            <p className="text-body-sm">Team Members: 5</p>
          </div>
        </Card>

        {/* Card with Actions */}
        <Card
          title="User Profile"
          actions={
            <>
              <Button size="sm" variant="ghost">Edit</Button>
              <Button size="sm" variant="outline">Share</Button>
            </>
          }
        >
          <div className="space-y-2">
            <p className="text-body-sm">Name: John Doe</p>
            <p className="text-body-sm">Email: john@example.com</p>
            <p className="text-body-sm">Role: Administrator</p>
          </div>
        </Card>

        {/* Card with Footer */}
        <Card
          title="Task Details"
          footer={
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-neutral-500">Due: Tomorrow</span>
              <Button size="sm">Mark Complete</Button>
            </div>
          }
        >
          <p className="text-body">
            Complete the design system implementation for the ERP project.
          </p>
        </Card>

        {/* Hoverable Card */}
        <Card
          title="Clickable Card"
          subtitle="Hover to see effect"
          hoverable
        >
          <p className="text-body">
            This card has a hover effect and can be used for clickable items.
          </p>
        </Card>

        {/* Card with Different Padding */}
        <Card title="Small Padding" padding="sm">
          <p className="text-body-sm">This card uses small padding.</p>
        </Card>

        <Card title="Large Padding" padding="lg">
          <p className="text-body">This card uses large padding for more spacious content.</p>
        </Card>

        {/* Card with No Padding */}
        <Card title="Custom Content" padding="none">
          <div className="p-0">
            <img
              src="https://via.placeholder.com/400x200"
              alt="Placeholder"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="text-body">
                This card has no padding on the content area, allowing for custom layouts.
              </p>
            </div>
          </div>
        </Card>

        {/* Complex Card Example */}
        <Card
          title="Dashboard Widget"
          subtitle="Real-time metrics"
          actions={
            <Button size="sm" variant="ghost">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>
          }
          footer={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" fullWidth>View Details</Button>
              <Button size="sm" fullWidth>Export</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-neutral-600">Total Sales</span>
              <span className="text-h3 font-bold text-success-600">$24,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-neutral-600">Orders</span>
              <span className="text-h4 font-semibold">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-neutral-600">Conversion Rate</span>
              <span className="text-body font-medium text-primary-600">3.2%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Combined example showing all components together
export const CombinedExample = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    assignee: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-h1 mb-6">Create New Task</h1>

      <Card
        title="Task Information"
        subtitle="Fill in the details for the new task"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            type="text"
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value })}
            placeholder="Enter task title"
            required
          />

          <FormField
            type="textarea"
            label="Description"
            name="description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Describe the task"
            rows={4}
          />

          <FormField
            type="select"
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value })}
            placeholder="Select priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]}
            required
          />

          <FormField
            type="text"
            label="Assignee"
            name="assignee"
            value={formData.assignee}
            onChange={(value) => setFormData({ ...formData, assignee: value })}
            placeholder="Enter assignee name"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" fullWidth>
              Create Task
            </Button>
            <Button type="button" variant="outline" fullWidth>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default {
  ButtonExamples,
  FormFieldExamples,
  CardExamples,
  CombinedExample,
};
