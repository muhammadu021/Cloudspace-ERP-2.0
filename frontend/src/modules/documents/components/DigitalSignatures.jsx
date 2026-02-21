import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  UserCheck,
  Shield
} from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress
} from '@/components/ui';

const DigitalSignatures = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [signatureRequests, setSignatureRequests] = useState([]);
  const [signatureHistory, setSignatureHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState(null);

  // Mock data for development
  const mockSignatureRequests = [
    {
      id: 1,
      document: {
        title: 'Employment Contract - John Doe',
        document_type: 'contract'
      },
      signer: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com'
      },
      requester: {
        first_name: 'Sarah',
        last_name: 'Johnson'
      },
      signature_type: 'digital',
      signature_method: 'click_to_sign',
      status: 'pending',
      signature_order: 1,
      requested_at: '2024-03-15T10:00:00Z',
      due_date: '2024-03-22T23:59:59Z',
      is_required: true,
      signer_role: 'Employee',
      comments: 'Please review and sign your employment contract.'
    },
    {
      id: 2,
      document: {
        title: 'NDA Agreement - Project Alpha',
        document_type: 'contract'
      },
      signer: {
        first_name: 'Alice',
        last_name: 'Wilson',
        email: 'alice.wilson@company.com'
      },
      requester: {
        first_name: 'Mike',
        last_name: 'Brown'
      },
      signature_type: 'electronic',
      signature_method: 'drawn_signature',
      status: 'signed',
      signature_order: 1,
      requested_at: '2024-03-10T14:30:00Z',
      signed_at: '2024-03-12T09:15:00Z',
      due_date: '2024-03-17T23:59:59Z',
      is_required: true,
      signer_role: 'Project Manager',
      comments: 'Confidentiality agreement for Project Alpha access.'
    },
    {
      id: 3,
      document: {
        title: 'Policy Acknowledgment - Remote Work',
        document_type: 'policy'
      },
      signer: {
        first_name: 'Bob',
        last_name: 'Smith',
        email: 'bob.smith@company.com'
      },
      requester: {
        first_name: 'HR',
        last_name: 'Department'
      },
      signature_type: 'digital',
      signature_method: 'click_to_sign',
      status: 'declined',
      signature_order: 1,
      requested_at: '2024-03-08T11:00:00Z',
      declined_at: '2024-03-09T16:30:00Z',
      due_date: '2024-03-15T23:59:59Z',
      is_required: false,
      signer_role: 'Developer',
      decline_reason: 'Need clarification on section 3.2',
      comments: 'Please acknowledge the updated remote work policy.'
    }
  ];

  const mockSignatureHistory = [
    {
      id: 1,
      document: {
        title: 'Q4 Financial Report',
        document_type: 'report'
      },
      signer: {
        first_name: 'CFO',
        last_name: 'Office',
        email: 'cfo@company.com'
      },
      signature_type: 'certificate_based',
      signed_at: '2024-03-01T15:45:00Z',
      ip_address: '192.168.1.100',
      device_info: {
        type: 'desktop',
        os: 'Windows 11',
        browser: 'Chrome 122'
      },
      verification_status: 'verified',
      certificate_info: {
        issuer: 'Corporate CA',
        serial: 'ABC123456789',
        valid_until: '2025-03-01'
      }
    },
    {
      id: 2,
      document: {
        title: 'Board Resolution 2024-001',
        document_type: 'policy'
      },
      signer: {
        first_name: 'Board',
        last_name: 'Secretary',
        email: 'secretary@company.com'
      },
      signature_type: 'digital',
      signed_at: '2024-02-28T10:20:00Z',
      ip_address: '10.0.0.50',
      device_info: {
        type: 'tablet',
        os: 'iOS 17',
        browser: 'Safari'
      },
      verification_status: 'verified'
    }
  ];

  useEffect(() => {
    loadSignatureRequests();
    loadSignatureHistory();
  }, []);

  const loadSignatureRequests = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      setSignatureRequests(mockSignatureRequests);
    } catch (error) {
      console.error('Error loading signature requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSignatureHistory = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      setSignatureHistory(mockSignatureHistory);
    } catch (error) {
      console.error('Error loading signature history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'signed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'delegated': return <Users className="h-4 w-4 text-primary" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'delegated': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignatureTypeIcon = (type) => {
    switch (type) {
      case 'digital': return <Shield className="h-4 w-4 text-primary" />;
      case 'electronic': return <PenTool className="h-4 w-4 text-green-500" />;
      case 'certificate_based': return <UserCheck className="h-4 w-4 text-purple-500" />;
      default: return <PenTool className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date() > new Date(dueDate);
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleSignDocument = (signature) => {
    setSelectedSignature(signature);
    setShowSignDialog(true);
  };

  const renderSignatureRequests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Signature Requests</h2>
          <p className="text-muted-foreground">Manage pending and completed signature requests</p>
        </div>
        <Button onClick={() => setShowRequestDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Signature
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search signature requests..."
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="digital">Digital</SelectItem>
            <SelectItem value="electronic">Electronic</SelectItem>
            <SelectItem value="certificate_based">Certificate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Signature Requests</CardTitle>
          <CardDescription>Documents awaiting signatures</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Signer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signatureRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.document.title}</div>
                      <div className="text-sm text-muted-foreground">{request.document.document_type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {request.signer.first_name} {request.signer.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{request.signer.email}</div>
                      {request.signer_role && (
                        <Badge variant="outline" className="mt-1">{request.signer_role}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getSignatureTypeIcon(request.signature_type)}
                      <span className="capitalize">{request.signature_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{formatDate(request.requested_at)}</div>
                      <div className="text-sm text-muted-foreground">
                        by {request.requester.first_name} {request.requester.last_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.due_date ? (
                      <div>
                        <div className={isOverdue(request.due_date) ? 'text-red-600 font-medium' : ''}>
                          {formatDate(request.due_date)}
                        </div>
                        {request.status === 'pending' && (
                          <div className="text-sm text-muted-foreground">
                            {isOverdue(request.due_date) ? (
                              <span className="text-red-600">Overdue</span>
                            ) : (
                              `${getDaysUntilDue(request.due_date)} days left`
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No deadline</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleSignDocument(request)}
                        >
                          <PenTool className="h-4 w-4 mr-1" />
                          Sign
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4" />
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

  const renderSignatureHistory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Signature History</h2>
          <p className="text-muted-foreground">View completed signatures and verification details</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search signature history..."
            className="pl-10"
          />
        </div>
        <Input type="date" className="w-48" />
        <Input type="date" className="w-48" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Signatures</CardTitle>
          <CardDescription>Verified signature records with audit trail</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Signer</TableHead>
                <TableHead>Signature Type</TableHead>
                <TableHead>Signed Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signatureHistory.map((signature) => (
                <TableRow key={signature.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{signature.document.title}</div>
                      <div className="text-sm text-muted-foreground">{signature.document.document_type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {signature.signer.first_name} {signature.signer.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{signature.signer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getSignatureTypeIcon(signature.signature_type)}
                      <span className="capitalize">{signature.signature_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(signature.signed_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="font-mono text-xs">{signature.ip_address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {signature.device_info.type === 'desktop' ? (
                        <Monitor className="h-3 w-3" />
                      ) : (
                        <Smartphone className="h-3 w-3" />
                      )}
                      <span className="text-xs">{signature.device_info.os}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge className="bg-green-100 text-green-800">
                        {signature.verification_status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
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

  const renderStatistics = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Signature Analytics</h2>
        <p className="text-muted-foreground">Overview of signature activity and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
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
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              91% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              2 overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3d</div>
            <p className="text-xs text-muted-foreground">
              Average completion time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Signature Types</CardTitle>
            <CardDescription>Distribution of signature methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Digital Signatures</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">65%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PenTool className="h-4 w-4 text-green-500" />
                <span>Electronic Signatures</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-purple-500" />
                <span>Certificate-based</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">10%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Trends</CardTitle>
            <CardDescription>Monthly signature completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>January 2024</span>
                <div className="flex items-center space-x-2">
                  <Progress value={88} className="w-24" />
                  <span className="text-sm text-muted-foreground">88%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>February 2024</span>
                <div className="flex items-center space-x-2">
                  <Progress value={92} className="w-24" />
                  <span className="text-sm text-muted-foreground">92%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>March 2024</span>
                <div className="flex items-center space-x-2">
                  <Progress value={91} className="w-24" />
                  <span className="text-sm text-muted-foreground">91%</span>
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">Signature Requests</TabsTrigger>
          <TabsTrigger value="history">Signature History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          {renderSignatureRequests()}
        </TabsContent>

        <TabsContent value="history">
          {renderSignatureHistory()}
        </TabsContent>

        <TabsContent value="analytics">
          {renderStatistics()}
        </TabsContent>
      </Tabs>

      {/* Request Signature Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Digital Signature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="document">Document</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select document to sign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doc1">Employment Contract - John Doe</SelectItem>
                  <SelectItem value="doc2">NDA Agreement - Project Alpha</SelectItem>
                  <SelectItem value="doc3">Policy Acknowledgment - Remote Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="signer">Signer</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select signer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user1">John Doe</SelectItem>
                    <SelectItem value="user2">Alice Wilson</SelectItem>
                    <SelectItem value="user3">Bob Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="signature-type">Signature Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital Signature</SelectItem>
                    <SelectItem value="electronic">Electronic Signature</SelectItem>
                    <SelectItem value="certificate_based">Certificate-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label htmlFor="signer-role">Signer Role</Label>
                <Input placeholder="e.g., Employee, Manager" />
              </div>
            </div>
            <div>
              <Label htmlFor="comments">Instructions</Label>
              <Textarea 
                placeholder="Please provide any special instructions for the signer..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowRequestDialog(false)}>
                Send Signature Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Document Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sign Document</DialogTitle>
          </DialogHeader>
          {selectedSignature && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">{selectedSignature.document.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSignature.comments}
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <PenTool className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Digital Signature Area</h3>
                <p className="text-muted-foreground mb-4">
                  Click here to apply your digital signature
                </p>
                <Button>
                  <PenTool className="h-4 w-4 mr-2" />
                  Apply Signature
                </Button>
              </div>

              <div>
                <Label htmlFor="signature-comments">Comments (Optional)</Label>
                <Textarea 
                  placeholder="Add any comments about this signature..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSignDialog(false)}>
                  Cancel
                </Button>
                <Button variant="outline">
                  Decline
                </Button>
                <Button onClick={() => setShowSignDialog(false)}>
                  Sign Document
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DigitalSignatures;