/**
 * Validation jQuery Plugin
 * Copyright 2011 Tom Rodenberg
 */
(function($){

  var validate = 'validate';
  var invalidClass = 'invalid';
  var optionalClass = 'optional';
  var defaultInvalidText = 'This field is invalid.';

  $.fn.validate = function(opts) {
    
    // Extend default parameters
    opts = $.extend({
      fields: {}
    }, opts);

    // Check that the element exists
    if(this.length == 0){
      return this;
    }

    var validator = this.data(validate) ?
      this.data(validate) :
      {};

    // Create a collection for processed fields
    validator.fields = {};

    var form = this;

    // Loop through each defined field and initialize the control
    $.each(opts.fields, function(fieldName, fieldOpts) {
      // attach form element to field options
      fieldOpts = $.extend({
        form: form,
        fieldName: fieldName,
        invalidText: defaultInvalidText
      }, fieldOpts);

      // Initialize the field
      $.validate.addField(fieldName, fieldOpts);

      validator.fields[fieldName] = fieldOpts;
    });
    
    // Attach configuration to form element
    this.data(validate, validator);

    // Return current element for chaining
    return this;
  }

  $.fn.validateAll = function() {
    return $.validate.validateAll(this);
  }

  $.fn.getFirstInvalid = function() {
    return $.validate.getFirstInvalid(this);
  }

  $.fn.hint = function(fn) {
    this.bind('validate-hint', fn);
  };

  $.fn.invalid = function(fn) {
    this.bind('validate-error', fn);
  };

  /**
   * Checks if a string value is empty
   */
  var empty = function(val, hint) {
    return !val || $.trim(val) == '';
  }

  /**
   * Default validation event handler for textboxes
   */
  var textboxOnValidate = function(evt, valid) {
    $(this).toggleClass(invalidClass, !valid);
  }

  /**
   * Updates data bind
   */
  var invokeSetters = function(form) {
    var formOpts = $(form).data(validate);
    if(formOpts && formOpts.fields) {
      $.each(formOpts.fields, function() {
        if(this.set && $.isFunction(this.set) && this.field) {
          var val = $.trim($(this.field).val());
          this.set(val);
          
          if(val != '') {
            $(this.field).removeClass(optionalClass);
          }
        }
      });
    }
  }

  /**
   * public static functions
   */
  $.validate = {
    
    // enables or disables validation mode
    // validation mode will send out and clear invalid messages immediately
    validationMode: false,

    setInvalidClass: function(s) {
      invalidClass = s;
    },

    // general validator function for required fields
    required: function(obj) {
      obj = $(obj);
      // required checkboxes must be checked
      if(obj.is(':checkbox')) {
        return obj.is(':checked');
      }
      return !empty(obj.val());
    },

    addField: function(name, opts){

      // check if already bound
      var input = $('#' + name);
      if(!input.data(validate)) {

        // attach options to input control
        input.data(validate, opts);

        // Set default validation status
        input.data('validation-status', false);

        // convert single validator to array
        if(opts.validators && !$.isArray(opts.validators)) {
          opts.validators = [opts.validators];
        }

        // create reference to field input
        opts.field = input;

        // process default text
        if(opts.optional && input.val() === '') {
          input.addClass(optionalClass);
        }

        // Bind default validate event handler
        input.bind(validate, textboxOnValidate);

        /**
         * If validation mode is active, update validation
         */
        var updateValidation = function(e) {

          if($.validate.validationMode) {
            var previousStatus = input.data('validation-status');

            var valid = $.validate.checkValidation(input);

            if(valid != previousStatus) {

              // Save status
              input.data('validation-status', valid);

              // If validation passes, check all fields
              if(valid) {
                $.validate.validateAll(opts.form);
              }

              // Trigger error event to show or hide errors
              opts.form.trigger('validate-error', opts.field, opts);

              // validate update hook
              input.trigger(validate, [valid]);
            }
          }
          else {
            $.validate.updateControls(opts.form);
          }
        }

        // Fire validation on keydown, only when in validation mode
        //
        // If validation is currently being displayed,
        // hide the validation.
        //
        // check if textbox or textarea
        input.keyup(updateValidation);
        input.change(updateValidation);

        // check if radio, checkbox, select
        input.click(updateValidation);

        /**
         * On blur, check other fields
         */
        input.blur(function() {
          // Add optional note if blank
          if(opts.optional && input.val() === '') {
            input.addClass(optionalClass);
          }

          // Reverify all inputs to accomodate auto-fill tools
          updateValidation();
        });

        input.focus(function() {
          // remove optional class
          if(opts.optional) {
            input.removeClass(optionalClass);
          }

          // hide / show error message
          if($.validate.validationMode) {
            opts.form.trigger('validate-error', opts.field, opts);
          }

          // hide / show hint text
          else if(!empty(opts.hintText)) {
            opts.form.trigger('validate-hint', opts.field, opts);
          }
        });
      }
    },

    /**
     * Fires the prevalidate event to allow associated controls to update
     * their values prior to validation
     */
    updateControls: function(form) {
      var opts = $(form).data(validate);
      if(opts && opts.fields) {
        // Loop through fields array
        $.each(opts.fields, function() {
          if(this.field) {
            this.field.trigger('prevalidate', [this, this.field]);
          }
        });
      }
    },
    
    /**
     * Refresh inputs from source data object
     */
    refresh: function(form) {
      var formOpts = $(form).data(validate);
      if(formOpts && formOpts.fields) {
        $.each(formOpts.fields, function() {
          if(this.get && $.isFunction(this.get) && this.field) {
            var inputVal = $.trim($(this.field).val());
            
            if(inputVal == '') {
              var val = this.get();
              $(this.field).val(val);
              if(val != '') {
                $(this.field).removeClass(optionalClass);
              }
            }
          }
        });
      }
      
      $.validate.updateControls(form);
    },

    /**
     * Returns true if validation passes
     */
    checkValidation: function(obj) {
      // if object has no validators,
      // validate to true
      var valid = true;

      // Type check input parameters
      if(obj) {
        var opts, input;

        // Data object was passed
        if($.isPlainObject(obj)) {
          opts = obj;
          input = $(opts.field);
        }

        // Input control was passed
        else {
          input = $(obj);
          opts = input.data(validate);
        }

        // Check if validators exist
        if(opts && opts.validators) {

          // pre-validate hook
          input.trigger('prevalidate', [opts, input]);

          // loop through all validators
          $.each(opts.validators, function () {

            // reset error text
            opts.currentInvalidText = null;

            // check if function exists
            if($.isFunction(this)) {
              // invoke validation function
              valid = this(input);

              // update error text if validation fails
              if(!valid) {
                opts.currentInvalidText = opts.invalidText;
              }
            }

            // additional params
            else if(this.validate && $.isFunction(this.validate)) {
              // invoke validation function
              valid = this.validate(input);
              if(!valid) {
                // update error text to rule specific error text if exists,
                // otherwise use field error text
                opts.currentInvalidText = !empty(this.invalidText) ?
                  this.invalidText : opts.invalidText;
              }
            }

            else {
              GWR.Log('Unknown validation option: ' + this);
            }

            // validate update hook
            input.trigger(validate, [valid]);

            // update values
            invokeSetters(opts.form);

            // foreach loop will terminate if valid is false
            return valid;
          });
        }
      }
      return valid;
    },

    /**
     * Check all registered inputs for validation
     */
    validateAll: function(form) {
      var valid = true;
      var opts = $(form).data(validate);
      if(opts && opts.fields) {
        // Loop through fields array
        $.each(opts.fields, function() {
          var thisValid = $.validate.checkValidation(this);
          valid = thisValid && valid;
        });
      }

      // update values
      invokeSetters(form);

      // return overall validation status
      return valid;
    },

    /**
     * Retrieves the first control that is invalid
     */
    getFirstInvalid: function(form) {
      var control;
      var opts = $(form).data(validate);
      if(opts && opts.fields) {
        // Loop through fields array
        $.each(opts.fields, function() {
          if(!$.validate.checkValidation(this) && this.field) {
            control = this.field;
            return false;
          }
        });
      }
      return control;
    },

    /**
     * Enable or disable validation mode
     * @param mode boolean
     */
    setValidationMode: function(mode) {
      $.validate.validationMode = mode;
    }
  }
})(jQuery);
