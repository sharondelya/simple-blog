const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { validationResult } = require('express-validator');

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const tag = req.query.tag || '';

    // Build query
    let query = { published: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username avatar')
      .populate('commentsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add avatar URLs to the response
    const blogsWithAvatars = blogs.map(blog => {
      const blogObj = blog.toObject();
      if (blogObj.author && blogObj.author.avatar) {
        blogObj.author.avatarUrl = blog.author.getAvatarUrl();
      }
      return blogObj;
    });

    const total = await Blog.countDocuments(query);

    res.json({
      blogs: blogsWithAvatars,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
};

// Get single blog
const getBlog = async (req, res) => {
  try {
    let blog;
    
    // Check if we're getting by ID (for edit route) or slug (for public view)
    if (req.route.path.includes('/edit/:id')) {
      // Get by ID for editing - don't increment views
      blog = await Blog.findById(req.params.id)
        .populate('author', 'username avatar bio')
        .populate('commentsCount');
    } else {
      // Get by slug for public viewing - increment views
      blog = await Blog.findOne({ slug: req.params.slug })
        .populate('author', 'username avatar bio')
        .populate('commentsCount');
        
      if (blog) {
        blog.views += 1;
        await blog.save();
      }
    }

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Add avatar URL to the response
    const blogObj = blog.toObject();
    if (blogObj.author && blogObj.author.avatar) {
      blogObj.author.avatarUrl = blog.author.getAvatarUrl();
    }

    res.json(blogObj);
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Server error while fetching blog' });
  }
};

// Create blog
const createBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, excerpt, coverImage, tags, published } = req.body;

    // Generate unique slug
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug exists and make it unique
    let existingBlog = await Blog.findOne({ slug });
    let counter = 1;
    let originalSlug = slug;
    
    while (existingBlog) {
      slug = `${originalSlug}-${counter}`;
      existingBlog = await Blog.findOne({ slug });
      counter++;
    }

    const blog = new Blog({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : Array.isArray(tags) ? tags.map(tag => tag.trim()) : []) : [],
      author: req.user._id,
      published: published || false
    });

    await blog.save();
    await blog.populate('author', 'username avatar');

    // Add avatar URL to the response
    const blogObj = blog.toObject();
    if (blogObj.author && blogObj.author.avatar) {
      blogObj.author.avatarUrl = blog.author.getAvatarUrl();
    }

    res.status(201).json({
      message: 'Blog created successfully',
      blog: blogObj
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error while creating blog' });
  }
};

// Update blog
const updateBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    const { title, content, excerpt, coverImage, tags, published } = req.body;

    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (tags) {
      // Handle both string and array cases
      if (typeof tags === 'string') {
        blog.tags = tags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(tags)) {
        blog.tags = tags.map(tag => tag.trim());
      } else {
        blog.tags = [];
      }
    }
    if (published !== undefined) blog.published = published;

    await blog.save();
    await blog.populate('author', 'username avatar');

    // Add avatar URL to the response
    const blogObj = blog.toObject();
    if (blogObj.author && blogObj.author.avatar) {
      blogObj.author.avatarUrl = blog.author.getAvatarUrl();
    }

    res.json({
      message: 'Blog updated successfully',
      blog: blogObj
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error while updating blog' });
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    // Delete associated comments
    await Comment.deleteMany({ blog: blog._id });
    
    // Delete blog
    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error while deleting blog' });
  }
};

// Like/Unlike blog
const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const userId = req.user._id;
    const likeIndex = blog.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      blog.likes.splice(likeIndex, 1);
    } else {
      // Like
      blog.likes.push(userId);
    }

    await blog.save();

    res.json({
      message: likeIndex > -1 ? 'Blog unliked' : 'Blog liked',
      likesCount: blog.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error while toggling like' });
  }
};

// Get user's blogs
const getUserBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ author: req.user._id })
      .populate('author', 'username avatar')
      .populate('commentsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add avatar URLs to the response
    const blogsWithAvatars = blogs.map(blog => {
      const blogObj = blog.toObject();
      if (blogObj.author && blogObj.author.avatar) {
        blogObj.author.avatarUrl = blog.author.getAvatarUrl();
      }
      return blogObj;
    });

    const total = await Blog.countDocuments({ author: req.user._id });

    res.json({
      blogs: blogsWithAvatars,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (error) {
    console.error('Get user blogs error:', error);
    res.status(500).json({ message: 'Server error while fetching user blogs' });
  }
};

module.exports = {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  getUserBlogs
};