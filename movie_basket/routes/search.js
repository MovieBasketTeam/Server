var express = require('express');
var Search = require('../models/search');
var router = express.Router();


router.get('/', function (req, res, next) {
  var result ={
    today_recommand : {[
      {
        c_id :1,
        small_category : '우울할 때'
      }
    ]}
  };

 Search.category( function (error, results) {
        if (error) {
            console.log("Connection error " + error);
            res.send(error);
        }
        else {
            res.status(201).send({result : result});
        }
    });
});


//성공시 추천순으로 바스켓 목록 보냄
router.get('/search/:c_id', function (req, res, next) {
  var results = {
    baskets : [
      {
        basket_id : 1,
        basket_name : '우울한 날 볼 영화',
        basket_image : '123.456.678/image.png',
        basket_like : 123
      }
    ]
  };


   Search.detail_category(req.params.c_id, function (error, results) {
          if (error) {
              console.log("Connection error " + error);
              res.send(error);
          }
          else {
              res.status(201).send({result : results});
          }
      });


  //res.send({result : results});
});


module.exports = router;
