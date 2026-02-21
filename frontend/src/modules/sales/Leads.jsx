import React from 'react';
import { Card, Badge, Button } from '../../design-system/components';
import { useGetLeadsQuery } from '../../store/api/salesApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus } from 'lucide-react';

export const Leads = () => {
  const { data: leads = [], isLoading } = useGetLeadsQuery();

  const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won'];

  const getLeadsByStage = (stage) => leads.filter(lead => lead.stage === stage);

  // Set page title and actions in the top nav bar
  usePageTitle('Lead Pipeline', [
    <Button key="add" variant="primary" size="sm">
      <Plus className="h-4 w-4 mr-1" />
      Add Lead
    </Button>
  ]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Kanban Board */}
      <div className="grid grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageLeads = getLeadsByStage(stage);
          return (
            <div key={stage} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{stage}</h3>
                <Badge variant="neutral">{stageLeads.length}</Badge>
              </div>
              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <div className="p-3">
                      <div className="font-medium text-gray-900 text-sm">{lead.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{lead.company}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-semibold text-gray-900">${lead.value.toLocaleString()}</span>
                        <Badge variant="info" className="text-xs">{lead.probability}%</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
