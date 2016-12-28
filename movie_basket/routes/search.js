var express = require('express');
var Search = require('../models/search');
var router = express.Router();


router.get('/', function (req, res, next) {
  var search_Category_info ={
    c_id : req.params.c_id,
    small_category  : req.session.small_category
  }
    // var result =
    // {
    //     today_recommand :
    //     [
    //         {
    //             c_id : 1,
    //             small_category : '우울할 때'
    //         },
    //         {
    //             c_id : 2,
    //             small_category : '우울할'
    //         }
    //     ]
    // };

    Search.category(search_Category_info, function (error, results) {
        if (error) {
            console.log("Connection error " + error);
            res.send(error);
        }
        else {
            res.status(201).send({result : results});
        }
    });
});


//성공시 추천순으로 바스켓 목록 보냄
router.get('/:c_id', function (req, res, next) {
  var searchInfo ={
    c_id : req.params.c_id,
    u_id : req.session.member_id
  }
  /*var results = {
    baskets : [
      {
        basket_id : 1,
        basket_name : '우울한 날 볼 영화',
        basket_image : '123.456.678/image.png',
        basket_like : 123
      }
    ]
  };*/


   Search.detailCategory(searchInfo, function (error, results) {
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
