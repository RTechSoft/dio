var path = require('path'),
  fs = require('fs'),
  modelsPath = path.resolve('./models/orm');
var Q = require('q');

module.exports = function(server) {

  server.get('/setting',
    function(req, res, next){
      if (!req.isAuthenticated()) {
        res.redirect('/login');
      }
      next();
    },
    function(req, res){
      var db = req.db;
      var Event = require(path.join(modelsPath, '/event'))(db);
      var Contact = require(path.join(modelsPath, '/contact'))(db);
      var UserAlertSetting = require(path.join(modelsPath, '/userAlertSetting'))(db);

      var disasters, contacts;

      Q.ninvoke(Event,'find')
      .then(function(disasters){
        disasters = disasters;
        return Q.ninvoke(Contact, find, {user_id: req.user.id});
      })
      .then(function(contacts){
        contacts = contacts;
        return Q.ninvoke(UserAlertSetting, find, {user_id: req.user.id});
      })
      .then(function(settings){
        // compose disaster
        var formattedDisasters = {};
        settings.forEach(function(setting){

        })
      })
      .then(function(){
        res.render('public/user/setting', { title: 'User Setting', disasters: disasters, contacts:contacts, });
        return true;
      })
    }
  );

  server.post('/setting',
    function(req, res, next){
      if (!req.isAuthenticated()) {
        res.redirect('/login');
      }
      next();
    },
    function(req, res){
      var postData = req.body;
      var db = req.db;
      var User = require(path.join(modelsPath, '/user'))(db);
      var Contact = require(path.join(modelsPath, '/contact'))(db);
      var UserAlertSetting = require(path.join(modelsPath, '/userAlertSetting'))(db);

      // compose


      Q.ninvoke(User, 'get', req.user.id)
      .then(function(user){
        return Q.ninvoke(Contact, 'remove', {user_id: user.id});
      })
      .then(function(deleted){
        return Q.ninvoke(UserAlertSetting, 'remove', {user_id: user.id});
      })
      .then(createContacts)
      .then(createUserAlertSetting)
      .fail(function(error){
        console.log(error);
      })

      function createContacts(users) {
        var contactData = [];
        var user = users[0];
        if (postData.MOBILE_NUMBER && postData.MOBILE_NUMBER.length > 0) {
          var mobileNumbers = postData.MOBILE_NUMBER;
          for (var i = 0; i < mobileNumbers.length; i++) {
            if (mobileNumbers[i] != '') {
              var formattedData = {
                type: 'MOBILE_NUMBER',
                value: mobileNumbers[i],
                user_id: user.id
              };
              contactData.push(formattedData);
            };
          };
        };

        if (postData.EMAILS && postData.EMAILS.length > 0) {
          var emails = postData.EMAILS;
          for (var i = 0; i < emails.length; i++) {
            if (emails[i] != '') {
              var formattedData = {
                type: 'EMAIL',
                value: emails[i],
                user_id: user.id
              };
              contactData.push(formattedData);
            };
          };
        };

        if (postData.OTHERS_MOBILE_NUMBER && postData.OTHERS_MOBILE_NUMBER.length > 0) {
          var mobileNumbers = postData.OTHERS_MOBILE_NUMBER;
          for (var i = 0; i < mobileNumbers.length; i++) {
            if (mobileNumbers[i] != '') {
              var formattedData = {
                type: 'OTHERS_MOBILE_NUMBER',
                value: mobileNumbers[i],
                user_id: user.id
              };
              contactData.push(formattedData);
            };
          };
        };

        if (postData.OTHERS_EMAIL && postData.OTHERS_EMAIL.length > 0) {
          var emails = postData.OTHERS_EMAIL;
          for (var i = 0; i < emails.length; i++) {
            if (emails[i] != '') {
              var formattedData = {
                type: 'OTHERS_EMAIL',
                value: emails[i],
                user_id: user.id
              };
              contactData.push(formattedData);
            }
          };
        };

        return Q.ninvoke(Contact,'create', contactData)
        .then(function(contacts){
          return contacts;
        })
        .fail(function(err) {
          console.log(err);
          throw new Error("Unable to create contacts.")
        });
      }

      function createUserAlertSetting(contacts) {
        var alertSettingData = []

        // contacts and alerts for user
        if (contacts && contacts.length > 0 && 
            postData.disaster && postData.disaster.length > 0) {
          var disasters = postData.disaster;

          for (var i = 0; i < disasters.length; i++) {

            contacts.forEach(function(contact){
              var type;
              if (contact.type == 'MOBILE_NUMBER' || contact.type == 'EMAIL') {
                type = 'SYSTEM';
                alertSettingData.push({
                  event_id: disasters[i],
                  user_id:contact.user_id,
                  contact_id:contact.id,
                  type: type
                });
              }
            })
          };
        }; 

        // contacts and alerts for user
        if (contacts && contacts.length > 0 && 
            postData.disaster_relative && postData.disaster_relative.length > 0) {
          var disasters = postData.disaster_relative;
          for (var i = 0; i < disasters.length; i++) {
            contacts.forEach(function(contact){
              var type;
              if (contact.type == 'OTHERS_MOBILE_NUMBER' || contact.type == 'OTHERS_EMAIL') {
                type = 'HELP';
                alertSettingData.push({
                  event_id: disasters[i],
                  user_id:contact.user_id,
                  contact_id:contact.id,
                  type: type
                });
              }
            })

          };
        };      

        Q.ninvoke(UserAlertSetting,'create', alertSettingData)
        .then(function(settings){
          return settings;
        })
        .fail(function(err) {
          console.log(err);
          throw new Error("Unable to create settings.")
        });
      }

    }
  );


}