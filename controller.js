// var async = require('asyncawait/async');
// var await = require('asyncawait/await');

exports.getAllusers1 = function(req, res) {
console.log("req=====",req)
    // UserModel.find({}).exec(function(err, result) {
    //     if (err) {
    //         res.json({
    //             code: 400,
    //             message: "error"
    //         })
    //     } else {
    //         res.json({
    //             code: 200,
    //             message: "GET",
    //             data: result
    //         })
    //     }
    // });
}
// function getAllusers(req, res){
//     console.log("req=====11",req)
// }

var getAllusers = async (req,res) =>{
    console.log("req----",req.body);
   }
module.exports= {
    getAllusers: getAllusers
}