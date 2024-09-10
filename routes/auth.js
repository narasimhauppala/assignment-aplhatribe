let express = require("express");
let router = express.Router();
const { check, validationResult, body } = require("express-validator");

const User = require("../models/user");
const { signup, signin, signout } = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("fullname", "please provide full name").isLength({
        min: 3,
      }),
    check("bio", "please provide some info about you").isLength({
      min: 1,
    }),
    check("username", "Name should be at least 3 char").isLength({
      min: 3,
    }),
    check("email", "Email is required", body("email"))
      .isEmail()
      .custom((value, { req, res, next }) => {
        return User.findOne({
          email: value,
        }).then((user) => {
          if (user) {
            return Promise.reject("Email already in use!");
          }
        });
      }),

    check("password", "Password should be at least 6 char").isLength({
      min: 6,
    }),
    check("username", "username should be in lowercase ", body("username"))
      .isLength({
        min: 6,
      })
      .custom((value, { req, res, next }) => {
        return User.findOne({
          username: value,
        }).then((user) => {
          if (user) {
            return Promise.reject("Username already in use!");
          }
        });
      }),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("password", "password field is required").isLength({
      min: 1,
    }),
  ],
  signin
);

router.get("/signout", signout);

module.exports = router;
