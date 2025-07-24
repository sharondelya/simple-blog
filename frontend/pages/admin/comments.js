import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuth } from '../../lib/useAuth';
import { adminAPI } from '../../lib/auth';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminComments() {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    if (user && user.role === 'admin') {
      fetchComments();
    }
  }, [user, currentPage, search]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      console.log('Fetching comments...');
      const data = await adminAPI.getAllCommentsAdmin({
        page: currentPage,
        search: search || undefined
      });
      console.log('Comments data received:', data);
      setComments(data.comments);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Comments fetch error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Error fetching comments: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await adminAPI.deleteCommentAdmin(commentId);
      toast.success('Comment deleted successfully');
      setComments(comments.filter(c => c._id !== commentId));
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting comment');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchComments();
  };

  const truncateContent = (content, maxLength = 150) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Comment Management</h1>
          <p className="mt-2 text-gray-600">Manage and moderate user comments</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search comments by content..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Comments Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="p-6 text-center">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No comments found</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {comments.map((comment) => (
                <li key={comment._id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <img
                          src={comment.author?.avatar?.data 
                            ? `data:${comment.author.avatar.contentType};base64,${comment.author.avatar.data}`
                            : '/default-avatar.png'
                          }
                          alt={comment.author?.username}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {comment.author?.username || 'Unknown User'}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {comment.author?.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700">
                          {truncateContent(comment.content)}
                        </p>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>
                          On: 
                          <Link 
                            href={`/blog/${comment.blog?.slug}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 ml-1"
                          >
                            {comment.blog?.title || 'Unknown Blog'}
                          </Link>
                        </span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                        <span>•</span>
                        <span>{comment.likesCount || 0} likes</span>
                        {comment.parentComment && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">Reply</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/blog/${comment.blog?.slug}#comment-${comment._id}`}
                        target="_blank"
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        View
                      </Link>
                      
                      <button
                        onClick={() => setDeleteConfirm(comment._id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this comment? This action will also delete all replies to this comment and any reports related to it. This cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDeleteComment(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
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