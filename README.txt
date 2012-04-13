jQuery Validate Plugin
Copyright 2012 Tom Rodenberg
Dual licensed under the MIT or GPL Version 2 licenses.
http://jquery.org/license

Sample usage:

  var currentProfile = new Profile();

  $('#form').validate({
    
    fields: {

      email: {
        set: function(val) {currentProfile.Email = val;},
        get: function() {return currentProfile.Email;},
        validators: [$.validate.required,
          {
            validate: function() {
              var value = $('#email').val();
              return validEmail(value);
            },
            invalidText: text.EmailFormatInvalid
          }
        ],
        invalidText: text.EmailInvalid
      },

      password: {
        set: function(val) {currentProfile.Password = val;},
        get: function() {return currentProfile.Password;},
        validators: validPassword,
        invalidText: text.PasswordMismatch,
        hintText: text.PasswordHint
      },

      first_name: {
        set: function(val) {currentProfile.FirstName = val;},
        get: function() {return currentProfile.FirstName;},
        validators: $.validate.required,
        invalidText: text.NameInvalid,
        hintText: text.NameHint
      },

      last_name: {
        set: function(val) {currentProfile.LastName = val;},
        get: function() {return currentProfile.LastName;},
        validators: $.validate.required,
        invalidText: text.NameInvalid,
        hintText: text.NameHint
      },

      address1: {
        set: function(val) {currentProfile.Address1 = val;},
        get: function() {return currentProfile.Address1;},
        validators: $.validate.required,
        invalidText: text.AddressInvalid
      },

      address2: {
        set: function(val) {currentProfile.Address2 = val;},
        get: function() {return currentProfile.Address2;},
        optional: true
      },

      country: {
        set: function(val) {currentProfile.Country = val;},
        get: function() {return currentProfile.Country;},
        validators: [$.validate.required, function() {
            var country = $('#country').val();
            if(country && $.trim(country) != '' && country != '--') {
              return true;
            }
            return false;
        }],
        invalidText: text.CountryInvalid
      },

      zip: {
        set: function(val) {currentProfile.Zip = val;},
        get: function() {return currentProfile.Zip;},
        validators: $.validate.required,
        invalidText: text.ZipInvalid
      },

      city: {
        set: function(val) {currentProfile.City = val;},
        get: function() {return currentProfile.City;},
        validators: $.validate.required,
        invalidText: text.CityInvalid
      },

      state: {
        set: function(val) {
          if(currentProfile.Country == "US") {
            currentProfile.State = val;
          }
        },
        get: function() {
          return currentProfile.State;
        },
        validators: function(obj) {
          if(currentProfile.Country == "US") {
            return $.validate.required(obj);
          }
          return true;
        },
        invalidText: text.StateInvalid
      }
    }
  });



Sample custom validator functions:

  /**
   * Validates password match
   */
  var validPassword =  function() {
    var a = $('#password').val();
    var b = $('#password2').val();
    return a == b;
  }
