import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuth } from '../../lib/useAuth';
import { adminAPI } from '../../lib/auth';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionConfirm, setActionConfirm] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    if (user && user.role === 'admin') {
      fetchReports();
    }
  }, [user, currentPage, statusFilter, typeFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching reports...');
      const data = await adminAPI.getAllReportsAdmin({
        page: currentPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      });
      console.log('Reports data received:', data);
      setReports(data.reports);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Reports fetch error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Error fetching reports: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      await adminAPI.updateReportStatusAdmin(reportId, { status });
      toast.success(`Report ${status} successfully`);
      setReports(reports.map(r => 
        r._id === reportId ? { ...r, status, resolvedAt: status === 'resolved' ? new Date() : null } : r
      ));
      setActionConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating report status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeClasses = {
      article: 'bg-blue-100 text-blue-800',
      blog: 'bg-blue-100 text-blue-800',
      comment: 'bg-purple-100 text-purple-800',
      general: 'bg-orange-100 text-orange-800'
    };
    
    const displayType = type === 'article' ? 'Blog' : type.charAt(0).toUpperCase() + type.slice(1);
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeClasses[type] || 'bg-gray-100 text-gray-800'}`}>
        {displayType}
      </span>
    );
  };

  const truncateContent = (content, maxLength = 100) => {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
          <p className="mt-2 text-gray-600">Review and manage user reports</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="article">Blog Reports</option>
              <option value="comment">Comment Reports</option>
              <option value="general">General Complaints</option>
            </select>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="p-6 text-center">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No reports found</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {reports.map((report) => (
                <li key={report._id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-3">
                        {getTypeBadge(report.type)}
                        <span className="mx-2">•</span>
                        {getStatusBadge(report.status)}
                        <span className="mx-2">•</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          Reason: {report.reason}
                        </h3>
                        {report.description && (
                          <p className="text-sm text-gray-600">
                            {truncateContent(report.description)}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center mb-2">
                          <img
                            src={report.reporter?.avatar?.data 
                              ? `data:${report.reporter.avatar.contentType};base64,${report.reporter.avatar.data}`
                              : '/default-avatar.png'
                            }
                            alt={report.reporter?.username}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Reported by: {report.reporter?.username || 'Unknown User'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <strong>Reported Content:</strong>
                          <div className="mt-1 p-2 bg-white rounded border">
                            {(report.type === 'blog' || report.type === 'article') ? (
                              <div>
                                {report.reportedItem?.slug ? (
                                  <Link
                                    href={`/blog/${report.reportedItem.slug}`}
                                    target="_blank"
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    {report.displayTitle || 'Unknown Blog'}
                                  </Link>
                                ) : (
                                  <span className="font-medium text-gray-700">
                                    {report.displayTitle || 'Unknown Blog'}
                                  </span>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  By: {report.displayAuthor || 'Unknown Author'}
                                </p>
                                {report.displayContent && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {report.displayContent}
                                  </p>
                                )}
                              </div>
                            ) : report.type === 'comment' ? (
                              <div>
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-700">Comment:</span>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {report.displayContent || 'Comment not found'}
                                  </p>
                                </div>
                                <div className="mb-1">
                                  <span className="text-xs text-gray-500">
                                    By: {report.displayAuthor || 'Unknown Author'}
                                  </span>
                                </div>
                                {report.reportedItem?.blog && (
                                  <div>
                                    <span className="text-xs text-gray-500">On article: </span>
                                    {report.reportedItem.blog.slug ? (
                                      <Link
                                        href={`/blog/${report.reportedItem.blog.slug}#comment-${report.reportedItem._id}`}
                                        target="_blank"
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                      >
                                        {report.reportedItem.blog.title || 'Blog Post'}
                                      </Link>
                                    ) : (
                                      <span className="text-xs text-gray-600 font-medium">
                                        {report.reportedItem.blog.title || 'Blog Post'}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : report.type === 'general' ? (
                              <div>
                                <span className="font-medium text-gray-700">
                                  General Complaint
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  No specific target
                                </p>
                                {report.displayContent && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {report.displayContent}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-gray-700">
                                  {report.displayTitle || 'Unknown Item'}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  {report.displayAuthor || 'Unknown'}
                                </p>
                                {report.displayContent && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {report.displayContent}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {report.status === 'resolved' && report.resolvedAt && (
                        <div className="text-sm text-green-600">
                          Resolved {formatDistanceToNow(new Date(report.resolvedAt), { addSuffix: true })}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {(report.type === 'blog' || report.type === 'article') && report.reportedItem?.slug && (
                        <Link
                          href={`/blog/${report.reportedItem.slug}`}
                          target="_blank"
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        >
                          View Blog
                        </Link>
                      )}
                      
                      {report.type === 'comment' && report.reportedItem?.blog?.slug && (
                        <Link
                          href={`/blog/${report.reportedItem.blog.slug}#comment-${report.reportedItem._id}`}
                          target="_blank"
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                        >
                          View Comment
                        </Link>
                      )}

                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setActionConfirm({ id: report._id, action: 'resolved' })}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            Resolve
                          </button>
                          
                          <button
                            onClick={() => setActionConfirm({ id: report._id, action: 'dismissed' })}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Action Confirmation Modal */}
        {actionConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm {actionConfirm.action === 'resolved' ? 'Resolve' : 'Dismiss'} Report
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to {actionConfirm.action === 'resolved' ? 'resolve' : 'dismiss'} this report?
                {actionConfirm.action === 'resolved' && ' This will mark the report as handled.'}
                {actionConfirm.action === 'dismissed' && ' This will mark the report as not requiring action.'}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleUpdateReportStatus(actionConfirm.id, actionConfirm.action)}
                  className={`flex-1 px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 ${
                    actionConfirm.action === 'resolved' 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                  }`}
                >
                  {actionConfirm.action === 'resolved' ? 'Resolve' : 'Dismiss'}
                </button>
                <button
                  onClick={() => setActionConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}