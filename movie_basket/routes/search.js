var express = require('express');
var Search = require('../models/search');
var logger = require('../models/winston').logger;
var router = express.Router();


router.get('/', function (req, res, next) {
    Search.category(function (error, results) {
        if (error) {
            logger.debug("3-a error");
            res.send(error);
        }
        else {
            res.send({ result : results });
        }
    });
});


//성공시 추천순으로 바스켓 목록 보냄
router.get('/:c_id', function (req, res, next) {
    var searchInfo ={
        member_token : req.headers.member_token,
        c_id : req.params.c_id
    }

    Search.detailCategory(searchInfo, function (error, results) {
        if (error) {
            logger.debug("3-b error");
            res.send(error);
        }
        else {
            res.status(201).send({result : results});
        }
    });
});


module.exports = router;
