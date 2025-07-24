import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const BlogCard = ({ blog }) => {
  // Generate avatar initials from username
  const getAvatarInitials = (username) => {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  };

  // Generate a consistent color based on username
  const getAvatarColor = (username) => {
    if (!username) return 'bg-gray-500';
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-center mb-2">
          {blog.author?.avatarUrl ? (
            <img
              src={blog.author.avatarUrl}
              alt={blog.author?.username}
              className="w-8 h-8 rounded-full mr-2 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-8 h-8 rounded-full mr-2 flex items-center justify-center text-white text-sm font-medium ${
              blog.author?.avatarUrl ? 'hidden' : ''
            } ${getAvatarColor(blog.author?.username)}`}
            style={{ display: blog.author?.avatarUrl ? 'none' : 'flex' }}
          >
            {getAvatarInitials(blog.author?.username)}
          </div>
          <span className="text-sm text-gray-600">{blog.author?.username}</span>
          <span className="text-gray-400 mx-2">•</span>
          <span className="text-sm text-gray-600">
            {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
          </span>
        </div>

        <h2 className="text-xl font-semibold mb-2">
          <Link href={`/blog/${blog.slug}`} className="hover:text-blue-600 transition-colors">
            {blog.title}
          </Link>
        </h2>

        <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{blog.readTime} min read</span>
            <span>{blog.views} views</span>
            <span>{blog.likesCount} likes</span>
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {blog.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;