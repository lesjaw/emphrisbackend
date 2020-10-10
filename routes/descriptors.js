var express = require('express');
var router = express.Router();
var usersModel = require('../models/descriptors');

/* GET users listing. */
router.get('/', function (req, res, next) {
    // Code to fetch the polls.
    var userObject = new usersModel();
    // Calling our model function.
    userObject.getAllUsers(function (err, Response) {
        if (err) {
            return res.json({
                "responseCode": 1,
                "responseDesc": Response
            });
        }
        res.json({
            "responseCode": 0,
            "responseDesc": "Success",
            "data": Response
        });
    });
    // res.send('respond with a resource');
});

/* GET users listing. */
router.get('/user/:id', function (req, res, next) {
    // Code to fetch the polls.
    var userObject = new usersModel();
    // Calling our model function.

    console.log(req.params)
    userObject.getAUser(req.params, function (err, Response) {
        if (err) {
            return res.json({
                "responseCode": 1,
                "responseDesc": Response
            });
        }
        res.json({
            "responseCode": 0,
            "responseDesc": "Success",
            "data": Response
        });
    });
    // res.send('respond with a resource');
});

router.post('/', function (req, res) {
    var userObject = new usersModel();

    userObject.checkUser(req.body, function (err, response) {

        if (err) {
            return res.json({
                "responseCode": 1,
                "responseDesc": err + response
            });
        }
        res.json({
            "responseCode": 0,
            "responseDesc": "Success",
            "data": response
        });

    });


})

router.put('/', function (req, res) {
    // Code to update votes of poll.
    var userObject = new usersModel();
    // Calling our model function.
    // We need to validate our payload here.
    userObject.updateUser(req.body, function (err, response) {
        if (err) {
            return res.json({
                "responseCode": 1,
                "responseDesc": response
            });
        }
        res.json({
            "responseCode": 0,
            "responseDesc": "Success",
            "data": response
        });
    });
});

module.exports = router;