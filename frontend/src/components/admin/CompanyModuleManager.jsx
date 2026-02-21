import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Switch } from '../ui';
import { Save, Package } from 'lucide-react';
import { MODULE_CONFIG } from '../../utils/navigationFilter';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const CompanyModuleManager = ({ company, onUpdate }) => {
  const [selectedModules, setSelectedModules] = useState(company.allowed_modules || []);
  const [saving, setSaving] = useState(false);

  const availableModules = ['hr', 'finance', 'inventory', 'sales', 'projects', 'support', 'documents', 'collaboration'];

  const toggleModule = (moduleName) => {
    setSelectedModules(prev => {
      if (prev.includes(moduleName)) {
        return prev.filter(m => m !== moduleName);
      } else {
        return [...prev, moduleName];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch(`/admin/companies/${company.id}/modules`, {
        modules: selectedModules
      });
      toast.success('Company modules updated successfully');
      if (onUpdate) {
        onUpdate({ ...company, allowed_modules: selectedModules });
      }
    } catch (error) {
      console.error('Failed to update modules:', error);
      toast.error(error.response?.data?.message || 'Failed to update modules');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Module Access Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select which modules this company can access based on their subscription plan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableModules.map(moduleName => {
              const config = MODULE_CONFIG[moduleName];
              const isEnabled = selectedModules.includes(moduleName);

              return (
                <div
                  key={moduleName}
                  className={`p-4 border rounded-lg transition-colors ${
                    isEnabled ? 'border-blue-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{config.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleModule(moduleName)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedModules.length} of {availableModules.length} modules enabled
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyModuleManager;
