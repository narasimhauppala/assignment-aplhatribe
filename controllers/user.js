const User = require("../models/user");

// Getting a user by UNIQUE ID
exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "No user was found",
      });
    }
    req.profile = user;
    next();
  });
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.role = undefined;
  req.profile.userprofile = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  if (
    req.body.role ||
    req.body.encry_password ||
    req.body.salt ||
    req.body.email ||
    req.body.purchases
  ) {
    return res.status(403).json({
      error: "Can't Update User",
    });
  }

  User.findByIdAndUpdate(
    {
      _id: req.profile._id,
    },
    {
      $set: req.body,
    },
    {
      new: true,
      useFindAndModify: false,
    },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authorized to update this user",
        });
      }
      user.salt = undefined;
      user.encry_password = undefined;
      res.json({success: true, message: 'Profile updated'});
    }
  );
};

