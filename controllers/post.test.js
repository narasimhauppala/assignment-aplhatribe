const mongoose = require("mongoose");
const { mockRequest, mockResponse } = require("jest-mock-req-res");
const Post = require("../models/post"); 
const postController = require("../controllers/post"); 

jest.mock("../models/post"); // Mocking the Mongoose model

// Mock Socket.io
const mockSocketIo = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

// Mock user profile for testing
const mockProfile = {
  _id: mongoose.Types.ObjectId().toString(),
  salt: "some-salt",
  encry_password: "some-encrypted-password",
  email: "user@example.com",
  fullname: "John Doe",
};

// Helper function to create a mock request object
const createMockRequest = (body = {}, profile = mockProfile, params = {}) => {
  const req = mockRequest({
    body,
    params,
  });
  req.profile = { ...profile }; 
  req.io = mockSocketIo;
  return req;
};

describe("Post Controller", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe("createPost", () => {
    it("should create a post successfully",   () => {
      const req = createMockRequest({
        title: "Valid Post Title",
        stockSymbol: "SYM",
        tags: ["tag1", "tag2"],
        description: "This is a valid description",
      });
      const res = mockResponse();

      Post.prototype.save = jest.fn().mockResolvedValue({
        _id: mongoose.Types.ObjectId(),
        title: "Valid Post Title",
        stockSymbol: "SYM",
        description: "This is a valid description",
        tags: ["tag1", "tag2"],
      });

        postController.createPost(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Post created successfully",
        })
      );
    });

    it("should return an error if title is too short",  () => {
      const req = createMockRequest({
        title: "Short",
        stockSymbol: "SYM",
        tags: ["tag1", "tag2"],
        description: "This is a valid description",
      });
      const res = mockResponse();

       postController.createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Title Should Be atleast 10 Chars ",
        })
      );
    });
  });

  describe("likePost", () => {
    it("should like a post successfully and emit an event",  () => {
      const req = createMockRequest({ _id: mongoose.Types.ObjectId().toString() });
      const res = mockResponse();

      Post.findByIdAndUpdate = jest.fn().mockResolvedValue({
        _id: req.body._id,
        likes: [req.profile._id],
      });

       postController.likePost(req, res);

      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
        req.body._id,
        { $push: { likes: req.profile._id } },
        { new: true }
      );
      expect(mockSocketIo.to).toHaveBeenCalledWith(req.body._id);
      expect(mockSocketIo.emit).toHaveBeenCalledWith("postUpdated", {
        message: "A post was liked",
        postId: req.body._id,
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Post liked" });
    });

    it("should return an error if post could not be liked",   () => {
      const req = createMockRequest({ _id: mongoose.Types.ObjectId().toString() });
      const res = mockResponse();

      // Move the mock setup inside the test case
      Post.findByIdAndUpdate.mockImplementationOnce(() => {
        return Promise.reject(new Error("Database error"));
      });

       postController.likePost(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: "Could not like the post",
      });
    });
  });

  describe("commentOnPost", () => {
    it("should add a comment successfully and emit an event",   () => {
      const req = createMockRequest(
        { _id: mongoose.Types.ObjectId().toString() },
        undefined,
        { text: "A valid comment" }
      );
      const res = mockResponse();

      Post.findByIdAndUpdate = jest.fn().mockResolvedValue({
        _id: req.body._id,
        comments: [{ comment_text: "A valid comment", postedBy: req.profile._id }],
      });

        postController.commentOnPost(req, res);

      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
        req.body._id,
        { $push: { comments: expect.any(Object) } },
        { new: true }
      );
      expect(mockSocketIo.to).toHaveBeenCalledWith(req.body._id);
      expect(mockSocketIo.emit).toHaveBeenCalledWith("postUpdated", {
        message: "A new comment was added",
        postId: req.body._id,
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Comment added successfully" });
    });

    it("should return an error if comment text is missing",   () => {
      const req = createMockRequest({ _id: mongoose.Types.ObjectId().toString() }, undefined, {});
      const res = mockResponse();

        postController.commentOnPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Comment text is required",
      });
    });
  });

  describe("deletePost", () => {
    it("should delete a post successfully",   () => {
      const req = createMockRequest({}, undefined, { postId: mongoose.Types.ObjectId().toString() });
      const res = mockResponse();

      Post.findOne = jest.fn().mockResolvedValue({
        _id: req.params.postId,
        postedBy: { _id: req.profile._id },
        remove: jest.fn().mockResolvedValue(true),
      });

        postController.deletePost(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Post deleted successfully" });
    });

    it("should return an error if post is not found",   () => {
      const req = createMockRequest({}, undefined, { postId: mongoose.Types.ObjectId().toString() });
      const res = mockResponse();

      Post.findOne = jest.fn().mockResolvedValue(null);

        postController.deletePost(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: "Can't delete the post",
      });
    });
  });
});
