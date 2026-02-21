import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Badge, Tabs } from '../../design-system/components';
import { useGetTicketQuery, useUpdateTicketMutation } from '../../store/api/supportApi';

export const TicketDetail = () => {
  const { id } = useParams();
  const { data: ticket, isLoading } = useGetTicketQuery(id);
  const [updateTicket] = useUpdateTicketMutation();

  const handleQuickAction = async (action) => {
    await updateTicket({ id, action });
  };

  if (isLoading) return <div>Loading...</div>;

  const tabs = [
    {
      id: 'conversation',
      label: 'Conversation',
      content: (
        <div className="space-y-4">
          {ticket?.responses?.map((response) => (
            <div key={response.id} className={`p-4 rounded-lg ${
              response.internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {response.user?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{response.user}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(response.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {response.internal && (
                  <Badge variant="warning" size="sm">Internal Note</Badge>
                )}
              </div>
              <div className="text-sm text-gray-700">{response.message}</div>
            </div>
          ))}
          <div className="mt-4">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows="4"
              placeholder="Type your response..."
            />
            <div className="flex gap-2 mt-2">
              <Button>Send Response</Button>
              <Button variant="outline">Add Internal Note</Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'customer',
      label: 'Customer History',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Customer Name</div>
              <div className="font-medium text-gray-900">{ticket?.customer?.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="font-medium text-gray-900">{ticket?.customer?.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Tickets</div>
              <div className="font-medium text-gray-900">{ticket?.customer?.totalTickets || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Satisfaction Score</div>
              <div className="font-medium text-gray-900">{ticket?.customer?.satisfactionScore || 'N/A'}</div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Previous Tickets</h4>
            <div className="space-y-2">
              {ticket?.customer?.previousTickets?.map((prevTicket) => (
                <div key={prevTicket.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{prevTicket.subject}</div>
                      <div className="text-xs text-gray-600">
                        #{prevTicket.ticketNumber} • {new Date(prevTicket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={prevTicket.status === 'resolved' ? 'success' : 'default'}>
                      {prevTicket.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      label: 'Suggested FAQs',
      content: (
        <div className="space-y-3">
          {ticket?.suggestedFAQs?.map((faq) => (
            <Card key={faq.id}>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-sm text-gray-600">{faq.answer}</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">Share with Customer</Button>
                  <Button variant="outline" size="sm">View Full Article</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Ticket #{ticket?.ticketNumber}
            </h1>
            <Badge variant={
              ticket?.priority === 'urgent' ? 'error' :
              ticket?.priority === 'high' ? 'warning' :
              ticket?.priority === 'medium' ? 'info' : 'default'
            }>
              {ticket?.priority}
            </Badge>
            <Badge variant={
              ticket?.status === 'resolved' ? 'success' :
              ticket?.status === 'open' ? 'warning' : 'default'
            }>
              {ticket?.status}
            </Badge>
          </div>
          <p className="text-lg text-gray-700 mt-2">{ticket?.subject}</p>
          <p className="text-sm text-gray-600 mt-1">
            Created {new Date(ticket?.createdAt).toLocaleString()} by {ticket?.customer?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleQuickAction('assign')}>
            Assign
          </Button>
          <Button variant="outline" onClick={() => handleQuickAction('escalate')}>
            Escalate
          </Button>
          <Button onClick={() => handleQuickAction('resolve')}>
            Resolve
          </Button>
        </div>
      </div>

      {/* Ticket Details */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Category</div>
              <div className="font-medium text-gray-900">{ticket?.category}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Assigned To</div>
              <div className="font-medium text-gray-900">{ticket?.assignedTo || 'Unassigned'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Response Time</div>
              <div className="font-medium text-gray-900">{ticket?.responseTime || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Resolution Time</div>
              <div className="font-medium text-gray-900">{ticket?.resolutionTime || 'Pending'}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabbed Content */}
      <Tabs tabs={tabs} defaultTab="conversation" />
    </div>
  );
};
