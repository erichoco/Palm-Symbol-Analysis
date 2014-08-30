var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/user/:name', function(req, res) {
    if ('all' === req.params.name) {
        fs.readdir('public/data', function(err, files) {
            // console.log(files);
            res.json(files);
        });
    }
    else {
        var str = req.params.name.replace(',', '/')
        fs.readdir('public/data/' + str, function(err, files) {
            if (err) {
                res.json(err);
            }
            else {
                res.json(files);
            }
        });
    }
});

module.exports = router;
