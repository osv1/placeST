
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

require('../models/userModel');
require('../models/placeModel');


var uri = 'mongodb://localhost:27017/placesProject';


mongoose.connect(uri,{}, function(error) {
  if(error){
    console.log('connection failed!')
  }else{
    console.log("Database connected successfully!");
  }
});