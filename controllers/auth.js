const User = require("../models/user");
const { check, validationResult } = require("express-validator");
let jwt = require("jsonwebtoken");
let  { expressjwt: expressJwt } = require("express-jwt");

//Signup the user
exports.signup = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  if (req.body.role) {
    return res.status(403).json({
      error: "Can't create user :(",
    });
  }
  const user = new User(req.body);
  //console.log(user,"USERRR");

  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "Not able to save user :(",
      });
    }
    res.json({
      success: true, 
      message: 'User registered successfully',
      firstname: user.firstname,
      userId: user._id,

    });
  });
};


//Signin the user
exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { emailorUsername, password } = req.body;
  //console.log(emailorUsername)
  if (emailorUsername === undefined && !emailorUsername) {
    return res.json({
      error: "enter email or username",
    });
  }
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()[0].msg,
    });
  }

  User.findOne(
    {
      //Using or to find with username and email
      $or: [
        {
          username: emailorUsername,
        },
        {
          email: emailorUsername,
        },
      ],
    },
    (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User email does not exists!",
        });
      }

      if (!user.autheticate(password)) {
        return res.status(401).json({
          error: "Email and password do not match!",
        });
      }
      if (user.isBanned === true) {
        return res.status(403).json({
          error: "You are banned!!",
        });
      }

      //create token
      const token = jwt.sign(
        {
          _id: user._id,
          expiresIn: "1d",
        },
        process.env.SECRET
      );
      //put token in cookie
      res.cookie("token", token, {
        expire: new Date() + 1,
      });

      //send response to frontend
      const { _id, name, email, role, username } = user;
      return res.json({
        token,
        user: {
          _id,
          name,
          email,
          role,
          username,
        },
      });
    }
  );
};



// Custom Middlewares
exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signout successfully",
  });
};

exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

// Is user Authenticated
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED!",
    });
  }
  next();
};
