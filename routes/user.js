const express = require("express");
const router = express();
const {
    getUserById,
    getUser,
    updateUser,
} = require("../controllers/user");
const {
    isSignedIn,
    isAuthenticated,
} = require("../controllers/auth");

//Router Parameters 
router.param("userId", getUserById);

router.get("/:userId", isSignedIn, isAuthenticated, getUser);
router.put("/profile/:userId", isSignedIn, isAuthenticated, updateUser);


module.exports = router;