
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var placeSchema = Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'userModel' },
    name: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: Number, required: true },
    rating: {type: Number , default: 0 },
    place_Id: {type: Number , default: 0 },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    isDelete:{ type: String, default: false}


});



var placeModel = mongoose.model('placeModel', placeSchema);

module.exports = placeModel;