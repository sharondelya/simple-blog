import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import CommentSection from '../../components/CommentSection';
import ReportModal from '../../components/ReportModal';
import UserProfileModal from '../../components/UserProfileModal';
import { useAuth } from '../../lib/useAuth';
import { blogAPI } from '../../lib/auth';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function BlogPost() {
  const { user } = useAuth();
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const data = await blogAPI.getBlog(slug);
      setBlog(data);
      setIsLiked(user && data.likes.includes(user._id));
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('Error fetching blog:', error);
      if (error.response?.status === 404) {
        router.push('/404');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const data = await blogAPI.toggleLike(blog._id);
      setIsLiked(data.isLiked);
      setLikesCount(data.likesCount);
      toast.success(data.message);
    } catch (error) {
      toast.error('Error updating like');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      await blogAPI.deleteBlog(blog._id);
      toast.success('Blog deleted successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error deleting blog');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-8"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Go back to home
          </Link>
        </div>
      </Layout>
    );
  }

  const canEditDelete = user && (user._id === blog.author._id || user.role === 'admin');

  return (
    <Layout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          {blog.coverImage && (
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img
                src={blog.author?.avatar?.data
                  ? `data:${blog.author.avatar.contentType};base64,${blog.author.avatar.data}`
                  : '/default-avatar.png'
                }
                alt={blog.author?.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p
                  className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                  title="Click to view author profile"
                  onClick={() => setShowUserProfileModal(true)}
                >
                  {blog.author?.username}
                </p>
                <div className="flex items-center text-sm text-gray-500 space-x-2">
                  <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                  <span>•</span>
                  <span>{blog.readTime} min read</span>
                  <span>•</span>
                  <span>{blog.views} views</span>
                </div>
              </div>
            </div>

            {canEditDelete && (
              <div className="flex space-x-2">
                <Link
                  href={`/blog/edit/${blog._id}`}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 py-4 border-y border-gray-200">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
                isLiked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>{likesCount}</span>
            </button>
            
            <span className="text-gray-500">{blog.commentsCount || 0} comments</span>
            
            {user && user._id !== blog.author._id && user.role !== 'admin' && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <span>🚩</span>
                <span>Report</span>
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="prose max-w-none mb-12">
          <div
            dangerouslySetInnerHTML={{ __html: blog.content }}
            className="rich-content"
          />
        </div>

        {/* Author Bio */}
        {blog.author?.bio && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-4">
              <img
                src={blog.author?.avatar?.data
                  ? `data:${blog.author.avatar.contentType};base64,${blog.author.avatar.data}`
                  : '/default-avatar.png'
                }
                alt={blog.author.username}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-lg mb-2">About {blog.author.username}</h3>
                <p className="text-gray-600">{blog.author.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentSection blogId={blog._id} />

        {/* Report Modal */}
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          itemType="article"
          itemId={blog._id}
          itemTitle={blog.title}
        />

        {/* User Profile Modal */}
        <UserProfileModal
          isOpen={showUserProfileModal}
          onClose={() => setShowUserProfileModal(false)}
          userId={blog.author?._id}
          username={blog.author?.username}
        />
      </article>
    </Layout>
  );
}