
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
userModel = mongoose.model('userModel');
placeModel = mongoose.model('placeModel');
var validator = require('validator');
var config = require('../models/config');
var utility = require('../models/utility.js');
var waterfall = require('async-waterfall');
const jwt = require('jsonwebtoken');
var formidable = require('formidable');
var fse = require('fs-extra');  
// var async = require('asyncawait/async');
// var await = require('asyncawait/await');
var UserCtrl = require("../controller");


router.get('/kk', UserCtrl.getAllusers);

router.get('/all',function(req,res){
  getAllDetails(req,res)
})
var getAllDetails = async (req,res) =>{
 console.log("req----",req);
}
router.post('/upload', function (req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.file.path;
    var newpath = __dirname + '/uploads/' + files.file.name;
    fse.move (oldpath, newpath, function (err) {
       if (err) { throw err; }
       res.json({ status: 1, message: 'File upload succcess' })
    })
  })
});

router.post('/signup', function (req, res) {
  var finalResponse = {};
  finalResponse.userData = {};
  var userObj = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  }
  if (!userObj.firstName || !userObj.lastName || !userObj.email || !userObj.password) {
    res.json({
      code: 400,
      data: {},
      message: "Required Fields is missing"
    });
  } else if (userObj.email && !validator.isEmail(userObj.email)) {
    res.json({
      code: 400,
      data: {},
      message: "Invalid Email"
    });
  } else {
    waterfall([
      function (callback) { 
        userModel.existCheck(userObj.email.trim(), '', function (err, emailExist) {
          if (err) {
            callback(err, false);
          } else {
            if (!emailExist) {
              res.json({
                code: 400,
                data: {},
                message: "This email is already exist. please try again with different email."
              });
            } else {
              callback(null, finalResponse);
            }
          }
        });
      },
      function (finalResponse, callback) {
        var obj = {
          firstName: userObj.firstName,
          lastName: userObj.lastName,
          email: userObj.email.toLowerCase(),
          password: req.body.password
        };

        var userRecord = new userModel(obj);
        userRecord.save(function (err, userData) {
          if (err) {
            callback(err, false);
          } else {
            finalResponse.userData = userData;
            callback(null, finalResponse);
          }
        });

      },
      function (finalResponse, callback) { 
        var date = new Date();
        var verifyToken = utility.getEncryptText(Math.random().toString(4).slice(2) + date.getTime());
        userModel.findOneAndUpdate({
          _id: finalResponse.userData._id
        }, {
            $set: {
              verifyToken: verifyToken
            }
          }, function (err, updatedUserdata) {
            if (err) {
              callback(err, false);
            } else {
              finalResponse.userData.verifyToken = verifyToken;
              callback(null, finalResponse);
            }
          });
      },
    ],
      function (err, data) {
        if (err) {
          res.json({
            code: 400,
            data: {},
            message: "Internal Error"
          });
        } else {
          res.json({
            code: 200,
            data: data,
            message: "You have signed up successfully."
          });
        }
      });
  }
})


router.post('/verifyAccount', function (req, res) {
  var finalResponse = {};
  finalResponse.userData = {};
  finalResponse.updatedUserData = {};
  waterfall([
    function (callback) {  
      userModel.findOne({
        verifyToken: req.body.verifyToken
      }).exec(function (err, userData) {

        if (err) {
          callback(err, false);
        } else {
          if (!userData) {
            res.json({
              code: 400,
              data: {},
              message: "Internal Error"
            });
          } else {
            finalResponse.userData = userData;
            callback(null, finalResponse);
          }
        }
      })
    },
    function (finalResponse, callback) { 
      if (finalResponse.userData.isDelete == true || finalResponse.userData.status == '1' || finalResponse.userData.status == '2') {
        res.json({
          code: 404,
          data: {},
          message: "Link Expired"
        });
      } else {
        userModel.findOneAndUpdate({
          verifyToken: req.body.verifyToken
        }, {
            $set: {
              status: '1',
            }
          }, function (err, data) {
            if (err) {
              callback(err, false);
            } else {
              finalResponse.updatedUserData = data;
              callback(null, finalResponse);
            }
          });
      }
    },
  ], function (err, data) {
    if (err) {
      res.json({
        code: 201,
        data: {},
        message: "Internal Error"
      });
    } else {
      res.json({
        code: 200,
        data: data,
        message: "Account Verified"
      });
    }
  });
})

router.post('/login', function (req, res) {
  var finalResponse = {};
  var condition = {};
  finalResponse.userData = {}
  var userObj = {
    email: req.body.email,
    password: req.body.password
  };
  if (!userObj.email || !userObj.password) {
    res.json({
      code: 400,
      data: {},
      message: "Required Fields is missing"
    });
  } else {
    waterfall([
      function (callback) {
        condition.email = userObj.email;
        condition.password = userObj.password;
        userModel.findOne(condition).exec(function (err, userData) {
          if (err) {
            callback(err, false);
          } else {
            if (!userData) {
              res.json({
                code: 406,
                data: {},
                message: "You have entered Invalid Username and Password"
              });
            } else if (userData.status == '0') {
              res.json({
                code: 500,
                data: {},
                message: "Your Account is not verified yet! Please check your mail and follow the instruction to verify your account."
              });
            } else {
              const JwtToken = jwt.sign({
                email: userData.email,
                _id: userData._id
              },
                'secret',
                {
                  expiresIn: 60 * 60 * 24 * 15
                });
              finalResponse.token = JwtToken;
              finalResponse.userData = userData;
              callback(null, finalResponse);
            }
          }
        })
      }
    ], function (err, data) {
      if (err) {
        res.json({
          code: 400,
          data: {},
          message: "Internal Error"
        });
      } else {
        res.json({
          code: 200,
          data: data,
          message: "Login Successfully"
        });
      }
    });
  }
});


router.post('/getMyPlaceDeleted/:id', function (req, res) {
  var finalResponse = {};
  finalResponse.placeView = {};

  waterfall([
    function (callback) {
      placeModel.update({
        _id:req.params.id
    },{
        $set: {isDelete:true}
    },function(err, placedata) {
        if (err) {
          callback(err, false);
        } else {
          finalResponse.placeView = placedata;
          callback(null, finalResponse);
        }
      });
    },
  ], function (err, data) {
    if (err) {
      res.json({
        code: 201,
        data: {},
        message: "Internal Error"
      });
    } else {
      res.json({
        code: 200,
        data: data,
        message: "Places Deleted Successfully"
      });
    }
  });

})

router.post('/updateMyPlace', function (req, res) {
  var finalResponse = {};
  finalResponse.placeView = {};

  waterfall([
    function (callback) {
      placeModel.findById({_id: req.params.id}, function (err, placedata) {
        if (err) {
          callback(err, false);
        } else {
          finalResponse.placeView = placedata;
          callback(null, finalResponse);
        }
      });
    },
  ], function (err, data) {
    if (err) {
      res.json({
        code: 201,
        data: {},
        message: "Internal Error"
      });
    } else {
      res.json({
        code: 200,
        data: data,
        message: "Record Found Successfully"
      });
    }
  });
})

  router.post('/logout/:id', function (req, res) {
    var finalResponse = {};
    finalResponse.placeView = {};
  
    waterfall([
      function (callback) {
        userModel.update({
          _id:req.params.id
      },{
          $set: {verifyToken:''}
      },function(err, userData) {
          if (err) {
            callback(err, false);
          } else {
            callback(null, finalResponse);
          }
        });
      },
    ], function (err, data) {
      if (err) {
        res.json({
          code: 201,
          data: {},
          message: "Internal Error"
        });
      } else {
        res.json({
          code: 200,
          data: {},
          message: "Logout Successfully"
        });
      }
    });
  
  })
router.post('/addMyPlaces', function (req, res) {
  var finalResponse = {};
  var userProfileId;
  waterfall([
    function (callback) { 
      userModel.findById({
        _id: req.body.user_id
      }).exec(function (err, userData) {
        if (err) {
          callback(err, false);
        } else {
          if (userData) {
            userProfileId = userData._id;
              callback(null, finalResponse);
          }
        }
      })
    },
    function (finalResponse, callback) {
      var obj = {
        name: req.body.name,
        city: req.body.city,
        pincode: req.body.pincode,
        rating: req.body.rating,
        latitude:req.body.latitude,
        longitude:req.body.longitude,
        createdBy: userProfileId,
      };

      var placesRecord = new placeModel(obj);
      placesRecord.save(function (err, placesRecord) {
        if (err) {
          callback(err, false);
        } else {
          finalResponse.placesRecord = placesRecord;
          callback(null, finalResponse);
        }
      });

    },
  ], function (err, data) {
    if (err) {
      res.json({
        code: 201,
        data: {},
        message: "Internal Error"
      });
    } else {
      res.json({
        code: 200,
        data: data,
        message: "Places Added to cart Successfully"
      });
    }
  });
})

module.exports = router;

