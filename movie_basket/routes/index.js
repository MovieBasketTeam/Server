var express = require('express');
var router = express.Router();
var Ad = require('../models/ad');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });


router.get('/', function (req, res, next) {
  var adInfo = {}
  Ad.recommendCategory(adInfo, function(error, results){
    if(error){
      console.log("Connection error" + error);
    }
    else {
      res.render('index', {result : results});
    }
  });
});



module.exports = router;
