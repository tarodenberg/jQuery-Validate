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
        set: function(val) {currentProfile.Address.Address1 = val;},
        get: function() {return currentProfile.Address.Address1;},
        validators: $.validate.required,
        invalidText: text.AddressInvalid
      },

      address2: {
        set: function(val) {currentProfile.Address.Address2 = val;},
        get: function() {return currentProfile.Address.Address2;},
        optional: true
      },

      country: {
        set: function(val) {currentProfile.Address.Country = val;},
        get: function() {return currentProfile.Address.Country;},
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
        set: function(val) {currentProfile.Address.Zip = val;},
        get: function() {return currentProfile.Address.Zip;},
        validators: $.validate.required,
        invalidText: text.ZipInvalid
      },

      city: {
        set: function(val) {currentProfile.Address.City = val;},
        get: function() {return currentProfile.Address.City;},
        validators: $.validate.required,
        invalidText: text.CityInvalid
      },

      state: {
        set: function(val) {
          if(currentProfile.Address.Country == "US") {
            currentProfile.Address.State = val;
          }
        },
        get: function() {
          return currentProfile.Address.State;
        },
        validators: function(obj) {
          if(currentProfile.Address.Country == "US") {
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
    // If a profile is created, do not check password fields
    if(currentProfile && !Util.Empty(currentProfile.ProfileId)) {
      return true;
    }

    var a = $('#password').val();
    var b = $('#password2').val();
    return a == b;
  }

  /**
   * Validates the mobile and home phone fields.
   * Only one or the other is required.
   */
  var validPhone = function() {
    var cell_phone = $.trim($('#cell_phone').val());
    if(!Util.Empty(cell_phone)) {
      return true;
    }
    var home_phone = $.trim($('#home_phone').val());
    if(!Util.Empty(home_phone)) {
      return true;
    }
    return false;
  }