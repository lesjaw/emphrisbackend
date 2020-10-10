var express = require('express');
var router = express.Router();
var usersModel = require('../models/users');
const fetch = require("node-fetch");
const {
  URLSearchParams
} = require('url');
var request = require('request');

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
  // Code to add new polls.
  var userObject = new usersModel();
  // Calling our model function.
  // We nee to validate our payload here.

  userObject.checkUser(req.body, function (err, response) {
    console.log(response)
    if (response == 1) {
      res.json({
        "responseCode": response,
        "responseDesc": "User exist!",
        "data": response
      });
    } else {
      userObject.addNewUsers(req.body, function (err, response) {
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
    }

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

router.post('/login', function (req, res) {
  var userObject = new usersModel();
  userObject.login(req.body, function (err, response) {

    res.json({
      "responseCode": 1,
      "responseDesc": "Success",
      "data": response
    });

  });

})


//API FLECTRA
router.post('/loginToken', (req, res) => {
  const params = new URLSearchParams();
  params.append('username', req.body.username);
  params.append('password', req.body.password);
  params.append('db', "emphris.olmatix.com");

  const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params,
    redirect: 'follow'
  };

  fetch("https://emphris.olmatix.com/api/auth/get_tokens", requestOptions)
    .then(response => response.text())
    .then(async result => {
      // console.log(result)
      const provResult = JSON.parse(result);
      if (provResult.access_token) {
        res.json(
          (provResult)
        )
      } else {
        res.json({
          error: "failed login"
        })
      }
    })
    .catch(error => console.log('error', error));
});

router.post('/get_tokens', (req, res) => {
  var options = {
    'method': 'POST',
    'url': 'https://emphris.olmatix.com/api/auth/get_tokens',
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      'username': 'lesjaw@gmail.com',
      'password': 'Mildstar@123',
      'db': 'emphris.olmatix.com'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    // console.log(response.body);
    res.json(
      JSON.parse((response.body))
    )
  });

});

router.post('/userdata/', (req, res) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "access_token": req.body.token
    }
  };

  fetch("https://emphris.olmatix.com/api/res.users/" + req.body.id, requestOptions)
    .then(response => response.text())
    .then(async result => {
      // console.log(result)
      const provResult = JSON.parse(result);
      if (provResult) {
        res.json(
          (provResult)
        )
      } else {
        res.json({
          error: "failed data"
        })
      }
    })
    .catch(error => console.log('error', error));
});

router.post('/employeedata', (req, res) => {
  var options = {
    'method': 'GET',
    'url': 'https://emphris.olmatix.com/api/hr.employee/',
    'headers': {
      'access_token': req.body.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      'filters': '[(\'user_id\',\'=\',' + req.body.id + ')]'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.json(
      JSON.parse((response.body))
    )
  });
});

router.post('/getAttendacebyId', (req, res) => {
  var options = {
    'method': 'GET',
    'url': 'https://emphris.olmatix.com/api/hr.attendance/' + req.body.id,
    'headers': {
      'access_token': req.body.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.json(
      JSON.parse((response.body))
    )
  });
});

router.post('/getAttendacebyEmployeeId', (req, res) => {
  var options = {
    'method': 'GET',
    'url': 'https://emphris.olmatix.com/api/hr.attendance',
    'headers': {
      'access_token': req.body.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      'filters': '[(\'employee_id\',\'=\',' + req.body.id + ')]'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.json(
      JSON.parse((response.body))
    )
  });
});

router.post('/CheckIn', async (req, res) => {
  var options = {
    'method': 'POST',
    'url': 'https://emphris.olmatix.com/api/hr.attendance/',
    'headers': {
      'access_token': req.body.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      'check_in': req.body.check_in,
      'employee_id': req.body.employeeId,
      'x_gps_in': req.body.gps
    }
  };
  await request(options, function (error, response) {
    if (error) throw new Error(error);
    res.json(
      JSON.parse((response.body))
    )
  });
});

router.post('/CheckOut', async (req, res) => {
  var options = {
    'method': 'PUT',
    'url': 'https://emphris.olmatix.com/api/hr.attendance/',
    'headers': {
      'access_token': req.body.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      'id': req.body.id,
      'check_out': req.body.check_out,
      'x_gps_out': req.body.gps
    }
  };
  await request(options, function (error, response) {
    if (error) throw new Error(error);
    res.json(
      JSON.parse((response.body))
    )
  });
});

router.post('/getWorkingHours', (req, res) => {
  var options = {
    'method': 'GET',
    'url': 'https://emphris.olmatix.com/api/resource.calendar.attendance',
    'headers': {
      'access_token': req.body.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      'filters': '[(\'calendar_id\',\'=\',' + req.body.id + ')]'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.json(
      JSON.parse((response.body))
    )
  });
});

router.post('/getData', (req, res) => {
  var options = {
    'method': 'GET',
    'url': 'https://emphris.olmatix.com/api/' + req.body.model,
    'headers': {
      'access_token': req.body.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      'filters': '[("' + req.body.field + '",\'=\',' + req.body.id + ')]'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.json(
      JSON.parse((response.body))
    )
  });
});

router.post('/getDataChannel', (req, res) => {
  var options = {
    'method': 'GET',
    'url': 'https://emphris.olmatix.com/api/' + req.body.model,
    'headers': {
      'access_token': req.body.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      'filters': '[("' + req.body.field + '",\'=\',' + req.body.id + ')]'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.json(
      JSON.parse((response.body))
    )
  });
});

module.exports = router;