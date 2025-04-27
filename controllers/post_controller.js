// controllers/PostController.js

const Post = require('../modals/post');
const User = require('../modals/user_profile');

// Create Post
exports.createPost = async (req, res) => {
  try {
    console.log(req.body, req.file);
    const {  description,  visibility } = req.body;
    const userId = req.user.id; // From decoded token
    const picture = req.file?.path; // 📸 Cloudinary URL
    const post = new Post({
      user: userId,
      description,
      picture,
      visibility
    });

    await post.save();

    // Optionally push post ID to user.posts array
    await User.findByIdAndUpdate(userId, { $push: { post: post._id } });

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user with connections
    const user = await User.findById(userId).populate('connection');
    const connections = user.connection.map(c => c._id.toString());

    // Get friends of friends
    const friendsOfFriendsSet = new Set();
    const friendsData = await User.find({ _id: { $in: connections } }).select('connection');

    friendsData.forEach(friend => {
      friend.connection.forEach(foaf => {
        const id = foaf.toString();
        if (id !== userId && !connections.includes(id)) {
          friendsOfFriendsSet.add(id);
        }
      });
    });

    const friendsOfFriends = Array.from(friendsOfFriendsSet);

    // Construct filter with fixed logic
    const postFilter = {
      $or: [
        {
          user: { $in: connections },
          visibility: { $in: ['friends', 'friends-of-friends'] }
        },
        {
          user:  userId ,
          visibility: { $in: ['friends', 'public', 'friends-of-friends'] }
        },
        {
          user: { $in: friendsOfFriends },
          visibility: 'friends-of-friends'
        },
        {
          visibility: 'public',
          user: { $ne: userId }
        }
      ]
    };

    // Get total count before pagination
    const totalPosts = await Post.countDocuments(postFilter);

    // Fetch paginated posts
    const paginatedPosts = await Post.find(postFilter)
      .populate('user', 'firstName lastName picture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Optional: Categorize posts
    const connectionPosts = [];
    const foafPosts = [];
    const publicPosts = [];

    paginatedPosts.forEach(post => {
      const postUserId = post.user._id.toString();

      if (connections.includes(postUserId)) {
        connectionPosts.push(post);
      } else if (friendsOfFriends.includes(postUserId)) {
        foafPosts.push(post);
      } else {
        publicPosts.push(post);
      }
    });

    // Response
    res.status(200).json({
      success: true,
      totalPosts,
      page,
      limit,
      totalPages: Math.ceil(totalPosts / limit),
      userConnections: connections.length,
      friendsOfFriends: friendsOfFriends.length,
      posts: paginatedPosts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feed',
      error: error.message
    });
  }
};


// controllers/PostController.js

// ... (keep your existing createPost and getFeed methods)

/**
 * @desc    Like or unlike a post
 * @route   POST /api/v1/post/like/:postId
 * @access  Private
 */
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(userId);
    let action;

    if (likeIndex === -1) {
      // Like the post
      post.likes.push(userId);
      action = 'liked';
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
      action = 'unliked';
    }

    await post.save();

    res.status(200).json({
      success: true,
      action,
      likes: post.likes,
      likesCount: post.likes.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing like',
      error: error.message
    });
  }
};

/**
 * @desc    Add a comment to a post
 * @route   POST /api/v1/post/comment/:postId
 * @access  Private
 */

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, userId } = req.body;
 
console.log("text dff", text, req.body)
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const newComment = {
      user: userId,
      text: text.trim()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate user details in the response
    const populatedPost = await Post.populate(post, {
      path: 'comments.user',
      select: 'firstName lastName picture'
    });

    const addedComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json({
      success: true,
      comment: addedComment,
      commentsCount: post.comments.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding comment',
      error: error.message
    });
  }
};

/**
 * @desc    Get comments for a post
 * @route   GET /api/v1/post/comments/:postId
 * @access  Private (or Public depending on post visibility)
 */
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const post = await Post.findById(postId)
      .select('comments')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName picture'
      })
      .slice('comments', [(page - 1) * limit, limit * 1]);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Get total count for pagination
    const totalComments = (await Post.findById(postId)).comments.length;

    res.status(200).json({
      success: true,
      comments: post.comments,
      totalComments,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalComments / limit)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching comments',
      error: error.message
    });
  }
};