import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Share2,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  Globe,
  Lock,
  Folder,
  FolderPlus,
  File,
  Image,
  Video,
  Music,
  Archive,
  Code,
  X,
  Check,
  AlertTriangle,
  Info,
  Users,
  Clock,
  Tag,
  ExternalLink,
  ChevronRight,
  Home,
  ArrowLeft,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { selfServiceService } from "../../../services/selfServiceService";
import { selectApiData } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";

const DocumentManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [selectedTab, setSelectedTab] = useState("private");
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterVisibility, setFilterVisibility] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "other",
    visibility: "private",
    tags: "",
    file: null,
  });

  const [folderForm, setFolderForm] = useState({
    name: "",
    description: "",
    access_type: "private",
  });

  // Fetch folders
  const {
    data: foldersData,
    isLoading: foldersLoading,
    refetch: refetchFolders,
  } = useQuery(
    ["folders", currentFolderId, selectedTab],
    () =>
      selfServiceService.getFolders({
        parent_folder_id: currentFolderId || null,
        access_type:
          selectedTab === "public"
            ? "public"
            : selectedTab === "department"
            ? "department"
            : selectedTab === "private"
            ? "private"
            : undefined,
      }),
    {
      select: selectApiData,
      enabled: true,
    }
  );

  // Fetch documents based on selected tab and folder
  const getDocumentsQuery = () => {
    const params = {
      page: currentPage,
      limit: 12,
      search: searchTerm,
      category: filterCategory,
      visibility: filterVisibility || selectedTab, // Use selectedTab as visibility filter if not explicitly set
      folder_id: currentFolderId || null,
    };

    switch (selectedTab) {
      case "private":
        return selfServiceService.getMyDocuments({
          ...params,
          visibility: "private",
        });
      case "department":
        return selfServiceService.getDepartmentDocuments({
          ...params,
          visibility: "department",
        });
      case "public":
        return selfServiceService.getPublicDocuments({
          ...params,
          visibility: "public",
        });
      case "shared":
        return selfServiceService.getSharedDocuments(params);
      default:
        return selfServiceService.getMyDocuments({
          ...params,
          visibility: "private",
        });
    }
  };

  const {
    data: documentsData,
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useQuery(
    [
      "documents",
      selectedTab,
      currentPage,
      searchTerm,
      filterCategory,
      filterVisibility,
      currentFolderId,
    ],
    getDocumentsQuery,
    {
      select: selectApiData,
      keepPreviousData: true,
    }
  );

  // Create folder mutation
  const createFolderMutation = useMutation(
    (folderData) => selfServiceService.createFolder(folderData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("folders");
        setShowCreateFolderModal(false);
        setFolderForm({
          name: "",
          description: "",
          access_type: "private",
        });
      },
      onError: (error) => {
        console.error("Create folder failed:", error);
        alert(error.response?.data?.message || "Failed to create folder");
      },
    }
  );

  // Delete folder mutation
  const deleteFolderMutation = useMutation(
    (id) => selfServiceService.deleteFolder(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("folders");
      },
      onError: (error) => {
        console.error("Delete folder failed:", error);
        alert(error.response?.data?.message || "Failed to delete folder");
      },
    }
  );

  // Upload document mutation
  const uploadDocumentMutation = useMutation(
    (formData) => selfServiceService.uploadDocument(formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("documents");
        setShowUploadModal(false);
        setUploadForm({
          title: "",
          description: "",
          category: "other",
          visibility: "private",
          tags: "",
          file: null,
        });
        setIsUploading(false);
        setUploadProgress(0);
      },
      onError: (error) => {
        console.error("Upload failed:", error);
        setIsUploading(false);
        setUploadProgress(0);
      },
    }
  );

  // Delete document mutation
  const deleteDocumentMutation = useMutation(
    (id) => selfServiceService.deleteDocument(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("documents");
      },
    }
  );

  // Share document mutation
  const shareDocumentMutation = useMutation(
    ({ id, shareData }) => selfServiceService.shareDocument(id, shareData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("documents");
        setShowShareModal(false);
        setSelectedDocument(null);
      },
    }
  );

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadForm((prev) => ({ ...prev, file }));
      if (!uploadForm.title) {
        setUploadForm((prev) => ({ ...prev, title: file.name.split(".")[0] }));
      }
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();

    const folderData = {
      ...folderForm,
      parent_folder_id: currentFolderId,
    };

    createFolderMutation.mutate(folderData);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", uploadForm.file);
    formData.append("title", uploadForm.title);
    formData.append("description", uploadForm.description);
    formData.append("category", uploadForm.category);
    formData.append("visibility", uploadForm.visibility);
    formData.append("tags", uploadForm.tags);
    if (currentFolderId) {
      formData.append("folder_id", currentFolderId);
    }

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await uploadDocumentMutation.mutateAsync(formData);
      setUploadProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await selfServiceService.downloadDocument(doc.id);
      const blob = response.data;
      if (!(blob instanceof Blob)) {
        throw new Error('Invalid file contents received');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = doc.file_name || doc.filename || doc.title || "document";
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(error.message || "Failed to download document");
    }
  };

  const handleDelete = (document) => {
    if (
      window.confirm(`Are you sure you want to delete "${document.title}"?`)
    ) {
      deleteDocumentMutation.mutate(document.id);
    }
  };

  const handleDeleteFolder = (folder) => {
    if (
      window.confirm(
        `Are you sure you want to delete folder "${folder.name}"? This folder must be empty.`
      )
    ) {
      deleteFolderMutation.mutate(folder.id);
    }
  };

  const handleShare = (document) => {
    setSelectedDocument(document);
    setShowShareModal(true);
  };

  const handleView = (document) => {
    setSelectedDocument(document);
    setShowViewModal(true);
  };

  const handleFolderClick = (folder) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      // Root
      setCurrentFolderId(null);
      setFolderPath([]);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setCurrentFolderId(newPath[newPath.length - 1].id);
      setFolderPath(newPath);
    }
  };

  const handleBackClick = () => {
    if (folderPath.length > 0) {
      const newPath = folderPath.slice(0, -1);
      setCurrentFolderId(
        newPath.length > 0 ? newPath[newPath.length - 1].id : null
      );
      setFolderPath(newPath);
    }
  };

  const getFileIcon = (filename, mimeType) => {
    const extension = filename?.split(".").pop()?.toLowerCase();
    const type = mimeType?.toLowerCase();

    if (
      type?.includes("image") ||
      ["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(extension)
    ) {
      return <Image className="h-8 w-8 text-green-500" />;
    }
    if (
      type?.includes("video") ||
      ["mp4", "avi", "mov", "wmv", "flv"].includes(extension)
    ) {
      return <Video className="h-8 w-8 text-red-500" />;
    }
    if (
      type?.includes("audio") ||
      ["mp3", "wav", "flac", "aac"].includes(extension)
    ) {
      return <Music className="h-8 w-8 text-purple-500" />;
    }
    if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      return <Archive className="h-8 w-8 text-orange-500" />;
    }
    if (["js", "html", "css", "php", "py", "java", "cpp"].includes(extension)) {
      return <Code className="h-8 w-8 text-primary" />;
    }
    if (["pdf"].includes(extension)) {
      return <FileText className="h-8 w-8 text-red-600" />;
    }
    if (["doc", "docx", "txt", "rtf"].includes(extension)) {
      return <FileText className="h-8 w-8 text-primary" />;
    }
    if (["xls", "xlsx", "csv"].includes(extension)) {
      return <FileText className="h-8 w-8 text-green-600" />;
    }
    if (["ppt", "pptx"].includes(extension)) {
      return <FileText className="h-8 w-8 text-orange-600" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getAccessTypeIcon = (accessType) => {
    switch (accessType) {
      case "public":
        return <Globe className="h-4 w-4 text-green-500" />;
      case "department":
        return <Building className="h-4 w-4 text-primary" />;
      case "private":
        return <Lock className="h-4 w-4 text-gray-500" />;
      default:
        return <Lock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAccessTypeBadge = (accessType) => {
    const config = {
      private: { color: "bg-gray-100 text-gray-800", label: "Private" },
      department: { color: "bg-blue-100 text-blue-800", label: "Department" },
      public: { color: "bg-green-100 text-green-800", label: "Public" },
    };

    const { color, label } = config[accessType] || config.private;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}
      >
        {getAccessTypeIcon(accessType)}
        <span className="ml-1">{label}</span>
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const documents = documentsData?.documents || [];
  const folders = foldersData?.folders || [];
  const pagination = documentsData?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Document Management
          </h1>
          <p className="text-gray-600 mt-1">
            Organize files in folders with access control
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload File
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "private", label: "Private", icon: Lock },
            { id: "public", label: "Public", icon: Globe },
            { id: "department", label: "Department", icon: Building },
            { id: "shared", label: "Shared with Me", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id);
                  setCurrentFolderId(null);
                  setFolderPath([]);
                  setFilterVisibility(""); // Reset visibility filter when changing tabs
                  setSearchTerm(""); // Reset search
                  setFilterCategory(""); // Reset category filter
                  setCurrentPage(1); // Reset to first page
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? "border-blue-500 text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Breadcrumb Navigation */}
      {folderPath.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="hover:text-primary flex items-center"
          >
            <Home className="h-4 w-4" />
          </button>
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="hover:text-primary"
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Back Button */}
      {currentFolderId && (
        <button
          onClick={handleBackClick}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
            >
              <option value="">All Categories</option>
              <option value="policy">Company Policies</option>
              <option value="handbook">Employee Handbook</option>
              <option value="forms">Forms & Templates</option>
              <option value="benefits">Benefits Information</option>
              <option value="training">Training Materials</option>
              <option value="procedures">Procedures & Guidelines</option>
              <option value="personal">Personal Documents</option>
              <option value="other">Other Documents</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Type
            </label>
            <select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
            >
              <option value="">All Access Types</option>
              <option value="private">Private</option>
              <option value="department">Department</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("");
                setFilterVisibility("");
              }}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Folders and Documents Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {foldersLoading || documentsLoading ? (
          <div className="p-12 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-500">Loading...</span>
            </div>
          </div>
        ) : folders.length === 0 && documents.length === 0 ? (
          <div className="p-12 text-center">
            <Folder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No items found
            </h3>
            <p className="text-gray-500">
              Create a folder or upload a file to get started
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* Folders Section */}
            {folders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Folders
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                      onDoubleClick={() => handleFolderClick(folder)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Folder className="h-10 w-10 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {folder.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {folder.subFolderCount || 0} folders,{" "}
                              {folder.documentCount || 0} files
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {folder.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {folder.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        {getAccessTypeBadge(folder.access_type)}
                        <button
                          onClick={() => handleFolderClick(folder)}
                          className="text-xs text-primary hover:text-primary-700"
                        >
                          Open →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Section */}
            {documents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Files
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(
                            document.filename || document.file_name,
                            document.mime_type
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {document.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {document.filename || document.file_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleView(document)}
                            className="p-1 text-gray-400 hover:text-primary"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(document)}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {selectedTab === "private" && (
                            <>
                              <button
                                onClick={() => handleShare(document)}
                                className="p-1 text-gray-400 hover:text-purple-600"
                                title="Share"
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(document)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {document.description}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(document.file_size)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {document.CreatedBy?.User?.first_name ||
                            document.uploaded_by?.name ||
                            "Unknown"}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(
                            document.created_at || document.uploaded_at
                          ).toLocaleDateString()}
                        </div>
                      </div>

                      {document.tags && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(Array.isArray(document.tags)
                            ? document.tags
                            : document.tags.split(",")
                          ).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
                            >
                              <Tag className="h-2 w-2 mr-1" />
                              {typeof tag === "string" ? tag.trim() : tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, pagination.totalPages)
                  )
                }
                disabled={currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * 12 + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * 12,
                      pagination.totalItems || documents.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {pagination.totalItems || documents.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(pagination.totalPages || 1, 5))].map(
                    (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? "z-10 bg-primary-50 border-blue-500 text-primary"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, pagination.totalPages || 1)
                      )
                    }
                    disabled={currentPage === (pagination.totalPages || 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderPlus className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Create New Folder
                    </h3>
                    <p className="text-sm text-gray-600">Organize your files</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name *
                </label>
                <input
                  type="text"
                  value={folderForm.name}
                  onChange={(e) =>
                    setFolderForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  placeholder="Enter folder name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={folderForm.description}
                  onChange={(e) =>
                    setFolderForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  placeholder="Describe the folder purpose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Type *
                </label>
                <select
                  value={folderForm.access_type}
                  onChange={(e) =>
                    setFolderForm((prev) => ({
                      ...prev,
                      access_type: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  required
                >
                  <option value="private">
                    🔒 Private (Only me + Super Admin)
                  </option>
                  <option value="department">
                    🏢 Department (
                    {user?.Employee?.Department?.name || "My Department"})
                  </option>
                  <option value="public">
                    🌐 Public (Everyone in company)
                  </option>
                </select>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900 mb-1">
                      Access Type Information:
                    </h4>
                    <ul className="text-blue-800 space-y-1">
                      <li>
                        <strong>Private:</strong> Only you and super admins can
                        see this folder
                      </li>
                      <li>
                        <strong>Department:</strong> All members of your
                        department can access
                      </li>
                      <li>
                        <strong>Public:</strong> All employees in the company
                        can access
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!folderForm.name}
                  className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Upload File
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentFolderId
                        ? `Uploading to: ${
                            folderPath[folderPath.length - 1]?.name
                          }`
                        : "Upload to root"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <div className="space-y-2 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary">
                        {uploadForm.file
                          ? uploadForm.file.name
                          : "Choose a file"}
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, Images up to
                      10MB
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                  required
                />
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Title *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                    placeholder="Enter file title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                    placeholder="Describe the file content and purpose"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) =>
                        setUploadForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      required
                    >
                      <option value="policy">📋 Company Policies</option>
                      <option value="handbook">📖 Employee Handbook</option>
                      <option value="forms">📝 Forms & Templates</option>
                      <option value="benefits">💝 Benefits Information</option>
                      <option value="training">🎓 Training Materials</option>
                      <option value="procedures">
                        📋 Procedures & Guidelines
                      </option>
                      <option value="personal">👤 Personal Documents</option>
                      <option value="other">📁 Other Documents</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibility *
                    </label>
                    <select
                      value={uploadForm.visibility}
                      onChange={(e) =>
                        setUploadForm((prev) => ({
                          ...prev,
                          visibility: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      required
                    >
                      <option value="private">🔒 Private (Only me)</option>
                      <option value="department">
                        🏢 Department (
                        {user?.Employee?.Department?.name || "My Department"})
                      </option>
                      <option value="public">
                        🌐 Public (Everyone in company)
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        tags: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                    placeholder="Enter tags separated by commas (e.g., policy, hr, important)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Tags help others find your file more easily
                  </p>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !uploadForm.file || !uploadForm.title || isUploading
                  }
                  className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  File Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  {getFileIcon(
                    selectedDocument.filename || selectedDocument.file_name,
                    selectedDocument.mime_type
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {selectedDocument.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedDocument.filename || selectedDocument.file_name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">
                      File Size:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {formatFileSize(selectedDocument.file_size)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Uploaded:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(
                        selectedDocument.created_at ||
                          selectedDocument.uploaded_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {selectedDocument.description && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      Description
                    </h5>
                    <p className="text-gray-600">
                      {selectedDocument.description}
                    </p>
                  </div>
                )}

                {selectedDocument.tags && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Tags</h5>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(selectedDocument.tags)
                        ? selectedDocument.tags
                        : selectedDocument.tags.split(",")
                      ).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {typeof tag === "string" ? tag.trim() : tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleDownload(selectedDocument)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                  {selectedTab === "my-documents" && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleShare(selectedDocument);
                      }}
                      className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-600 flex items-center"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Share File</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedDocument.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedDocument.filename || selectedDocument.file_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Visibility
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500">
                    <option value="private">🔒 Private (Only me)</option>
                    <option value="department">🏢 Department</option>
                    <option value="public">🌐 Public (Everyone)</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle share logic here
                      setShowShareModal(false);
                    }}
                    className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-600"
                  >
                    Update Sharing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
