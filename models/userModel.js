
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userModelSchema = Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    verifyToken: { type: String, default: '' },
    status: { type: String, default: 0 }, 
    isDelete: { type: Boolean, default: false },
    userProfile: { type: String },
});



userModelSchema.statics.existCheck = function (email, id, callback) {
    var where = {};
    if (id) {
        where = {
            $or: [{ email: new RegExp('^' + email + '$', "i") }],
            _id: { $ne: id }
        };
    } else {
        where = { $or: [{ email: new RegExp('^' + email + '$', "i") }] };
    }
    userModel.findOne(where, function (err, userdata) {
        if (err) {
            callback(err)
        } else {
            if (userdata) {
                callback(null, false);
            } else {
                callback(null, true);
            }
        }
    });
};

var userModel = mongoose.model('userModel', userModelSchema);

module.exports = userModel;