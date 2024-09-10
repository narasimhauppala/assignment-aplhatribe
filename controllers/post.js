const { response } = require("express");
const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");

// get all posts of a user s
exports.getAllPosts = (req, res) => {
  Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => {
      res.send(403).json({ err });
    });
};
//get All Posts of a users

// get post by id
exports.getPostById = (req, res, next, id) => {
  Post.findById(id).exec((err, post) => {
    if (err || !post) {
      return res.status(400).json({
        error: "No post was found.",
      });
    }
    req.body = post; //changed
    next();
  });
};

//End of get PostBy id

//Creating a Post
exports.createPost = (req, res) => {
  const { stockSymbol, title, tags, description } = req.body;

  console.log("GIII", req.body);
  if (title.length < 10) {
    return res.status(400).json({
      error: "Title Should Be atleast 10 Chars ",
    });
  }
  if (stockSymbol.length < 3) {
    return res.status(400).json({
      error: "Stock Symbol Is Required!",
    });
  }

  if (!title || !tags || !description) {
    return res.json({
      error: "Fill Out All Blanks",
    });
  }
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.email = undefined;
  const post = new Post({
    title,
    stockSymbol,
    description,
    tags,
    postedBy: req.profile._id,
  });

  //console.log(post)
  post.save((err, post) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to save your Post",
      });
    }
    let postid = post._id;
    res.json({ success: true, postid, message: "Post created successfully" });
  });
};
// End of Create Post

//Get All Posts Of a singel User
exports.getPost = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.email = undefined;

  Post.find({
    postedBy: req.profile._id,
  })
    .populate("postedBy", "_id fullname")
    .populate("comments", "_id comment_text")
    .populate("comments.postedBy", "_id fullname")
    .exec((err, post) => {
      if (err) {
        return res.status(400).json({
          error: "No Posts found",
        });
      }
      res.json(post);
    });
};

exports.getPostWithID = (req, res) => {
  // Remove sensitive information from the profile
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.email = undefined;

  Post.find({
    _id: req.params.postId,
  })
    .populate("postedBy", "_id fullname")
    .populate("likes", "_id")
    .populate("comments", "_id comment_text postedBy")
    .populate("comments.postedBy", "_id fullname")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(400).json({
          error: "No Posts found",
        });
      }

      // Destructure the first post from the result array
      let post_data = post[0];

      // Prepare the response with all comments
      let comments = post_data.comments.map((comment) => {
        return {
          commentId: comment._id,
          userId: comment.postedBy._id,
          username: comment.postedBy.fullname,
          comment: comment.comment_text,
        };
      });

      // Send response with all comments
      res.json({
        postId: post_data._id,
        stockSymbol: post_data.stockSymbol,
        title: post_data.title,
        description: post_data.description,
        likesCount: post_data.likes.length,
        comments: comments,
      });
    });
};

// Like a Post
exports.likePost = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.email = undefined;

  Post.findByIdAndUpdate(
    req.body._id,
    {
      $push: {
        likes: req.profile._id,
      },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({
        error: "Could not like the post",
      });
    } else {
      // Emit like update to Socket.io using req.io
      req.io.to(req.body._id).emit("postUpdated", {
        message: "A post was liked",
        postId: req.body._id,
      });
      res.json({ success: true, message: "Post liked" });
    }
  });
};

// unlike a Post
exports.unlikePost = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.email = undefined;

  Post.findByIdAndUpdate(
    req.body._id,
    {
      $pull: {
        likes: req.profile._id,
      },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({
        error: "Could not dislike the post",
      });
    } else {
      res.json({ success: true, message: "Post unliked" });
    }
  });
};

exports.getAllStockPostsFilters = (req, res) => {
  const { stockSymbol, tags, sortBy } = req.query;

  // Create a filter object based on the optional query parameters
  let filter = {};
  if (stockSymbol) {
    filter.stockSymbol = stockSymbol;
  }
  if (tags) {
    filter.tags = { $in: tags.split(",") }; // Assuming tags are provided as a comma-separated string
  }

  // Determine the sorting order
  let sortCriteria = {};
  if (sortBy === "likes") {
    sortCriteria.likesCount = -1; // Sort by likes in descending order
  } else {
    sortCriteria.createdAt = -1; // Default sort by date in descending order
  }

  // Fetch posts based on filter and sort criteria
  Post.find(filter)
    .sort(sortCriteria)
    .select("postId stockSymbol title description likesCount createdAt") // Select specific fields to return
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to fetch posts", details: err });
    });
};

//put a comment
exports.commentOnPost = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.email = undefined;
  const { text } = req.query;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Comment text is required" });
  }

  const comment = {
    comment_text: text,
    postedBy: req.profile._id,
  };

  Post.findByIdAndUpdate(
    req.body._id,
    {
      $push: { comments: comment },
    },
    { new: true }
  )
    .populate("comments.postedBy", "_id fullname")
    .populate("postedBy", "_id fullname")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        // Emit comment update to Socket.io using req.io
        req.io.to(req.body._id).emit("postUpdated", {
          message: "A new comment was added",
          postId: req.body._id,
        });
        res.json({ success: true, message: "Comment added successfully" });
      }
    });
};
// Delete a comment on a post
exports.deleteCommentOnPost = (req, res) => {
  const { postId, commentId } = req.params; // Extract post and comment ID from params

  // Find the post by its ID
  Post.findById(postId)
    .populate("comments.postedBy", "_id name") // Populate comments to get user details
    .exec((err, post) => {
      if (err || !post) {
        return res.status(400).json({
          error: "Post not found",
        });
      }

      // Find the comment in the post
      const comment = post.comments.id(commentId); // Use Mongoose subdocument method to find comment

      if (!comment) {
        return res.status(404).json({
          error: "Comment not found",
        });
      }

      // Check if the comment's postedBy ID matches the logged-in user's ID
      if (comment.postedBy._id.toString() !== req.profile._id.toString()) {
        return res.status(403).json({
          error: "You are not authorized to delete this comment",
        });
      }

      // Remove the comment
      comment.remove();

      // Save the updated post
      post.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: "Failed to delete the comment",
          });
        }
        res.json({ success: true, message: "Comment deleted successfully" });
      });
    });
};

// Paginated Posts Retrieval
exports.getPaginatedPosts = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Calculate skip value
  const skip = (page - 1) * limit;

  // Find posts with pagination
  Post.find()
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .select("_id stockSymbol title description likes createdAt")
    .populate("postedBy", "_id fullname")
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to fetch posts",
        });
      }

      // Count total documents
      Post.countDocuments().exec((err, count) => {
        if (err) {
          return res.status(400).json({
            error: "Failed to count posts",
          });
        }

        const totalPages = Math.ceil(count / limit);
        const metadata = {
          totalPosts: count,
          currentPage: page,
          totalPages,
          limit,
        };

        // Prepare response
        const formattedPosts = posts.map((post) => ({
          postId: post._id,
          stockSymbol: post.stockSymbol,
          title: post.title,
          description: post.description,
          likesCount: post.likes.length,
          createdAt: post.createdAt,
        }));

        // Send response
        res.json({
          posts: formattedPosts,
          pagination: metadata,
        });
      });
    });
};

// delete a post
exports.deletePost = (req, res) => {
  Post.findOne({
    _id: req.params.postId,
  }).exec((err, post) => {
    if (err || !post) {
      return res.status(422).json({
        error: "Can't delete the post",
      });
    }
    if (post.postedBy._id.toString() === req.profile._id.toString()) {
      post
        .remove()
        .then((result) => {
          res.json({ success: true, message: "Post deleted successfully" });
        })
        .catch((err) => {
          return res.status(400).json({
            err,
            error:
              "Can't delete the post as the user signin should be same who have posted this post.",
          });
        });
    }
  });
};
