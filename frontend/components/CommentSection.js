import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/useAuth';
import { commentAPI } from '../lib/auth';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import ReportModal from './ReportModal';
import UserProfileModal from './UserProfileModal';

const Comment = ({ comment, isReply = false, onReply, replyingTo, replyContent, setReplyContent, onSubmitReply, onCancelReply, user, onReport, onShowUserProfile, onLike }) => (
  <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <img
          src={comment.author?.avatar?.data
            ? `data:${comment.author.avatar.contentType};base64,${comment.author.avatar.data}`
            : '/default-avatar.png'
          }
          alt={comment.author?.username}
          className="w-6 h-6 rounded-full mr-2"
        />
        <span
          className="font-medium text-sm cursor-pointer hover:text-blue-600"
          title="Click to view author profile"
          onClick={() => onShowUserProfile(comment.author?._id, comment.author?.username)}
        >
          {comment.author?.username}
        </span>
        <span className="text-gray-500 text-xs ml-2">
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-gray-700 mb-2">{comment.content}</p>
      <div className="flex items-center space-x-4 text-sm">
        <button
          onClick={() => onLike(comment._id)}
          className={`flex items-center space-x-1 ${
            comment.isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-blue-600'
          }`}
          disabled={!user}
        >
          <span>{comment.isLiked ? '❤️' : '🤍'}</span>
          <span>{comment.likesCount || 0} likes</span>
        </button>
        {!isReply && (
          <button
            onClick={() => onReply(comment._id)}
            className="text-gray-500 hover:text-blue-600"
          >
            Reply
          </button>
        )}
        {user && user._id !== comment.author?._id && user.role !== 'admin' && (
          <button
            onClick={() => onReport(comment)}
            className="text-red-500 hover:text-red-600"
          >
            Report
          </button>
        )}
      </div>

      {replyingTo === comment._id && (
        <form onSubmit={(e) => onSubmitReply(e, comment._id)} className="mt-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            required
            autoFocus
          />
          <div className="flex space-x-2 mt-2">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Reply
            </button>
            <button
              type="button"
              onClick={onCancelReply}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>

    {comment.replies && comment.replies.map(reply => (
      <Comment
        key={reply._id}
        comment={reply}
        isReply={true}
        onReply={onReply}
        replyingTo={replyingTo}
        replyContent={replyContent}
        setReplyContent={setReplyContent}
        onSubmitReply={onSubmitReply}
        onCancelReply={onCancelReply}
        user={user}
        onReport={onReport}
        onShowUserProfile={onShowUserProfile}
        onLike={onLike}
      />
    ))}
  </div>
);

const CommentSection = ({ blogId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingComment, setReportingComment] = useState(null);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    try {
      const data = await commentAPI.getBlogComments(blogId);
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    try {
      const data = await commentAPI.createComment(blogId, {
        content: newComment
      });
      setComments([data.comment, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Error adding comment');
    }
  };

  const handleSubmitReply = useCallback(async (e, parentId) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to reply');
      return;
    }

    try {
      const data = await commentAPI.createComment(blogId, {
        content: replyContent,
        parentComment: parentId
      });
      
      // Add reply to the parent comment
      setComments(prevComments => prevComments.map(comment => 
        comment._id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), data.comment] }
          : comment
      ));
      
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply added successfully');
    } catch (error) {
      toast.error('Error adding reply');
    }
  }, [user, blogId, replyContent]);

  const handleReply = useCallback((commentId) => {
    setReplyingTo(commentId);
    setReplyContent('');
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyContent('');
  }, []);

  const handleReportComment = useCallback((comment) => {
    if (!user) {
      toast.error('Please login to report comments');
      return;
    }
    if (user._id === comment.author?._id) {
      toast.error('You cannot report your own comment');
      return;
    }
    setReportingComment(comment);
    setShowReportModal(true);
  }, [user]);

  const handleCloseReportModal = useCallback(() => {
    setShowReportModal(false);
    setReportingComment(null);
  }, []);

  const handleShowUserProfile = useCallback((userId, username) => {
    setSelectedUser({ id: userId, username });
    setShowUserProfileModal(true);
  }, []);

  const handleCloseUserProfileModal = useCallback(() => {
    setShowUserProfileModal(false);
    setSelectedUser(null);
  }, []);

  const handleLikeComment = useCallback(async (commentId) => {
    if (!user) {
      toast.error('Please login to like comments');
      return;
    }

    try {
      const data = await commentAPI.toggleCommentLike(commentId);
      
      // Update the comment in the state
      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              likesCount: data.likesCount,
              isLiked: data.isLiked
            };
          }
          // Also check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply._id === commentId
                  ? { ...reply, likesCount: data.likesCount, isLiked: data.isLiked }
                  : reply
              )
            };
          }
          return comment;
        })
      );
      
      toast.success(data.message);
    } catch (error) {
      toast.error('Error updating like');
    }
  }, [user]);

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments ({comments.length})</h3>

      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            required
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Post Comment
          </button>
        </form>
      )}

      {!user && (
        <p className="text-gray-600 mb-6">
          Please <a href="/login" className="text-blue-600">login</a> to comment.
        </p>
      )}

      <div>
        {comments.map(comment => (
          <Comment
            key={comment._id}
            comment={comment}
            onReply={handleReply}
            replyingTo={replyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onSubmitReply={handleSubmitReply}
            onCancelReply={handleCancelReply}
            user={user}
            onReport={handleReportComment}
            onShowUserProfile={handleShowUserProfile}
            onLike={handleLikeComment}
          />
        ))}
        
        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        itemType="comment"
        itemId={reportingComment?._id}
        itemTitle={`Comment by ${reportingComment?.author?.username}`}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showUserProfileModal}
        onClose={handleCloseUserProfileModal}
        userId={selectedUser?.id}
        username={selectedUser?.username}
      />
    </div>
  );
};

export default CommentSection;