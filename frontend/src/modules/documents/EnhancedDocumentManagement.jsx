import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Lock,
  Unlock,
  Eye,
  Download,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Plus,
  Search,
  Filter,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch,
  Checkbox
} from '@/components/ui';

const DocumentAccessControl = () => {
  const [activeTab, setActiveTab] = useState('permissions');
  const [accessRules, setAccessRules] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showRestrictionsDialog, setShowRestrictionsDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Mock data for development
  const mockAccessRules = [];

  const mockAccessLogs = [];

  useEffect(() => {
    loadAccessRules();
    loadAccessLogs();
  }, []);

  const loadAccessRules = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      setAccessRules(mockAccessRules);
    } catch (error) {
      console.error('Error loading access rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccessLogs = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      setAccessLogs(mockAccessLogs);
    } catch (error) {
      console.error('Error loading access logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionIcon = (level) => {
    switch (level) {
      case 'view': return <Eye className="h-4 w-4 text-primary" />;
      case 'download': return <Download className="h-4 w-4 text-green-500" />;
      case 'edit': return <Edit className="h-4 w-4 text-orange-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-red-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPermissionColor = (level) => {
    switch (level) {
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'download': return 'bg-green-100 text-green-800';
      case 'edit': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessTypeIcon = (type) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'role': return <Shield className="h-4 w-4" />;
      case 'department': return <Users className="h-4 w-4" />;
      case 'group': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpired = (expiryDate) => {
    return expiryDate && new Date() > new Date(expiryDate);
  };

  const renderPermissions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Access Permissions</h2>
          <p className="text-muted-foreground">Manage document access permissions and restrictions</p>
        </div>
        <Button onClick={() => setShowPermissionDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Grant Access
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search permissions..."
            className="pl-10"
          />
        </div>
        <select className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
          <option value="all">All Documents</option>
          <option value="handbook">Handbooks</option>
          <option value="policy">Policies</option>
          <option value="report">Reports</option>
        </select>
        <select className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
          <option value="all">All Types</option>
          <option value="user">User</option>
          <option value="role">Role</option>
          <option value="department">Department</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Rules</CardTitle>
          <CardDescription>Current access permissions for documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Access Type</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Permission</TableHead>
                <TableHead>Granted By</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rule.document.title}</div>
                      <div className="text-sm text-muted-foreground">{rule.document.document_type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getAccessTypeIcon(rule.access_type)}
                      <Badge variant="outline">{rule.access_type}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{rule.entity_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getPermissionIcon(rule.permission_level)}
                      <Badge className={getPermissionColor(rule.permission_level)}>
                        {rule.permission_level}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {rule.granted_by.first_name} {rule.granted_by.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(rule.granted_at)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {rule.expires_at ? (
                      <span className={isExpired(rule.expires_at) ? 'text-red-600' : ''}>
                        {formatDate(rule.expires_at)}
                        {isExpired(rule.expires_at) && (
                          <Badge className="ml-2 bg-red-100 text-red-800">Expired</Badge>
                        )}
                      </span>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Never</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{rule.access_count} accesses</div>
                      {rule.last_accessed && (
                        <div className="text-muted-foreground">
                          Last: {formatDate(rule.last_accessed)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
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

  const renderAccessLogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Access Logs</h2>
          <p className="text-muted-foreground">Monitor document access and security events</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search access logs..."
            className="pl-10"
          />
        </div>
        <select className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
          <option value="all">All Actions</option>
          <option value="viewed">Viewed</option>
          <option value="downloaded">Downloaded</option>
          <option value="denied">Access Denied</option>
        </select>
        <Input type="date" className="w-48" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Activity</CardTitle>
          <CardDescription>Recent document access attempts and results</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="font-medium">{log.document.title}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {log.user.first_name} {log.user.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{log.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getResultIcon(log.result)}
                      <Badge className={getResultColor(log.result)}>
                        {log.result}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="font-mono text-xs">{log.ip_address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {log.device_info.type === 'desktop' ? (
                        <Monitor className="h-3 w-3" />
                      ) : (
                        <Smartphone className="h-3 w-3" />
                      )}
                      <span className="text-xs">{log.device_info.os}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {log.duration_ms && (
                        <div>Duration: {Math.round(log.duration_ms / 1000)}s</div>
                      )}
                      {log.file_size && (
                        <div>Size: {formatFileSize(log.file_size)}</div>
                      )}
                      {log.watermark_applied && (
                        <Badge className="bg-blue-100 text-blue-800">Watermarked</Badge>
                      )}
                      {log.error_message && (
                        <div className="text-red-600">{log.error_message}</div>
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

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Security Settings</h2>
        <p className="text-muted-foreground">Configure global security policies and restrictions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Default Access Policies</CardTitle>
            <CardDescription>Set default access rules for new documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="require-auth">Require Authentication</Label>
              <Switch id="require-auth" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="audit-all">Audit All Access</Label>
              <Switch id="audit-all" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="watermark">Apply Watermarks</Label>
              <Switch id="watermark" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="download-tracking">Track Downloads</Label>
              <Switch id="download-tracking" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Restrictions</CardTitle>
            <CardDescription>Configure security restrictions and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="30" />
            </div>
            <div>
              <Label htmlFor="max-downloads">Max Downloads per User</Label>
              <Input id="max-downloads" type="number" defaultValue="10" />
            </div>
            <div>
              <Label htmlFor="ip-whitelist">IP Whitelist</Label>
              <Textarea
                id="ip-whitelist"
                placeholder="192.168.1.0/24
10.0.0.0/8"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Settings</CardTitle>
            <CardDescription>Configure compliance and retention policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gdpr-compliance">GDPR Compliance</Label>
              <Switch id="gdpr-compliance" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="data-retention">Data Retention</Label>
              <Switch id="data-retention" defaultChecked />
            </div>
            <div>
              <Label htmlFor="retention-period">Retention Period (years)</Label>
              <Input id="retention-period" type="number" defaultValue="7" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Settings</CardTitle>
            <CardDescription>Configure security alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="failed-access">Failed Access Attempts</Label>
              <Switch id="failed-access" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="unusual-activity">Unusual Activity</Label>
              <Switch id="unusual-activity" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="bulk-downloads">Bulk Downloads</Label>
              <Switch id="bulk-downloads" defaultChecked />
            </div>
            <div>
              <Label htmlFor="alert-threshold">Alert Threshold (attempts)</Label>
              <Input id="alert-threshold" type="number" defaultValue="5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Access Control</h1>
          <p className="text-muted-foreground">Manage document permissions and security</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Security Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="logs">Access Logs</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions">
          {renderPermissions()}
        </TabsContent>

        <TabsContent value="logs">
          {renderAccessLogs()}
        </TabsContent>

        <TabsContent value="security">
          {renderSecuritySettings()}
        </TabsContent>
      </Tabs>

      {/* Grant Permission Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grant Document Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="document">Document</Label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                <option value="">Select document</option>
                <option value="doc1">Employee Handbook 2024</option>
                <option value="doc2">Financial Report Q1 2024</option>
                <option value="doc3">Confidential Strategy Document</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="access-type">Access Type</Label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select type</option>
                  <option value="user">User</option>
                  <option value="role">Role</option>
                  <option value="department">Department</option>
                  <option value="group">Group</option>
                </select>
              </div>
              <div>
                <Label htmlFor="entity">Entity</Label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select entity</option>
                  <option value="user1">John Doe</option>
                  <option value="role1">Manager</option>
                  <option value="dept1">Finance Department</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="permission">Permission Level</Label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select permission</option>
                  <option value="view">View</option>
                  <option value="download">Download</option>
                  <option value="edit">Edit</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <Label htmlFor="expires">Expires</Label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <Label>Additional Restrictions</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="watermark" />
                  <Label htmlFor="watermark">Apply watermark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="no-download" />
                  <Label htmlFor="no-download">Prevent downloads</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="time-limit" />
                  <Label htmlFor="time-limit">Time-based access</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowPermissionDialog(false)}>
                Grant Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentAccessControl;