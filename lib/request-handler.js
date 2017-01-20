var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  // Links.reset().fetch().then(function(links) {
  //   res.status(200).send(links.models);
  // });
  Link.find({}, function (err, data) {
    if (err) { throw err; }
    console.log(data, 'LINK DATA'); 
    res.status(200).send(data);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  Link.findOne({url: uri}, function (err, data) {
    if (err) { throw err; }
    if (data !== null) {
      res.status(200).send(data);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });
        newLink.initialize();
        newLink.save(function(error, saveData) {
          if (error) { throw error; }
          console.log(saveData);
          res.status(200).send(newLink);
        });
      });
    }
  });

  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.status(200).send(found.attributes);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.log('Error reading URL heading: ', err);
  //         return res.sendStatus(404);
  //       }
  //       var newLink = new Link({
  //         url: uri,
  //         title: title,
  //         baseUrl: req.headers.origin
  //       });
  //       newLink.save().then(function(newLink) {
  //         Links.add(newLink);
  //         res.status(200).send(newLink);
  //       });
  //     });
  //   }
  // });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({username: username}, 'username password', function(err, data) {
    if (err) { throw err; }
    console.log(data);
    if (data === null ) {
      res.redirect('/login');
    } else {
      var hash = data.password;
      bcrypt.compare(password, hash, function (error, result) {
        if (result === true) {
          util.createSession(req, res, data);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = bcrypt.hashSync(req.body.password);

  User.findOne({username: username}, 'username', function(err, data) {
    if (err) { throw err; }
    if (data === null) {
      new User ({username: username, password: password}).save(function(error, saveData) {
        if (error) { throw error; }
        console.log(saveData + ' saved to user collection');
        util.createSession(req, res, saveData);
      });
    } else {
      console.log('Account already exists');
      res.redirect('/');
    }
  });

};

exports.navToLink = function(req, res) {
  console.log(req.params, 'REQ PARAMS');
  Link.findOne({code: req.params[0]}, function (err, data) {
    console.log(data);
    if (data === null) {
      res.redirect('/');
    } else {
      //data.set({visits: data.visits += 1}).save(function(error, saveData) {
      data.set({ visits: data.get('visits') + 1 }).save(function(error, saveData) {
        if (error) {
          console.log('-------------error: ', error);
          throw error;
        }
        console.log('URLLLLLL', data.get('url'));
        return res.redirect(data.get('url'));
      });
    }
  });
  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};