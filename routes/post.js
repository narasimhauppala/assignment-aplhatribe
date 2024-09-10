let express = require("express");
let router = express.Router();
const {
    createPost,
    getPost,
    likePost,
    unlikePost,
    getPostById,
    commentOnPost,
    deletePost,
    getAllPosts,
    deleteCommentOnPost,
    getAllStockPostsFilters,
    getPostWithID,
    getPaginatedPosts
} = require("../controllers/post");
const {
    isSignedIn,
    isAuthenticated
} = require("../controllers/auth");
const {
    getUserById
} = require("../controllers/user");



//Parameters of the url
router.param("userId", getUserById);
router.param("postId", getPostById);

router.get("/all/:userId", isSignedIn, isAuthenticated, getAllPosts);

//get tasks with filters any signdin user can consume this endpoint
router.get("/posts", isSignedIn, getAllStockPostsFilters);

//paginated get posts
router.get("/paginated",getPaginatedPosts)

//Creating a Post Route here
router.post("/createpost/:userId", isSignedIn, isAuthenticated, createPost);

//Get all posts of a singel user
router.get("/mypost/:userId", isSignedIn, isAuthenticated, getPost)

//Get a post
router.get("/:userId/:postId", isSignedIn, isAuthenticated, getPostWithID)

//Like a Post
router.put("/like/:userId/:postId", isSignedIn, isAuthenticated, likePost);

//unLike a Post 
router.put("/unlike/:userId/:postId", isSignedIn, isAuthenticated, unlikePost);

//comment on a post
router.put("/comment/:userId/:postId", isSignedIn, isAuthenticated, commentOnPost);

// delete a comment on a post
router.delete("/comment/:userId/:postId/:commentId", isSignedIn, isAuthenticated, deleteCommentOnPost);


//delete a post 
router.delete("/delete/:userId/:postId", isSignedIn, isAuthenticated, deletePost);


module.exports = router;