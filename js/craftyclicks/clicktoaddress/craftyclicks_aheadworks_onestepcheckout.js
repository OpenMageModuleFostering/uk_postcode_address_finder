/*
// This is a collection of JavaScript code to allow easy integration of
// the Crafty Clicks postcode / address finder functionality into these
// Magento checkout extensions :
//
// Ahead Works One Step Checkout
// http://www.magentocommerce.com/magento-connect/one-step-checkout-by-aheadworks-8829.html
//
// Provided by www.CraftyClicks.co.uk
//
// Requires standard CraftyClicks JS - tested with v4.9.2
//
// If you copy/use/modify this code - please keep this
// comment header in place
//
// Copyright (c) 2009-2013 Crafty Clicks (http://www.craftyclicks.com)
//
// This code relies on prototype js, you must have a reasonably recent version loaded
// in your template. Magento should include it as standard.
//
// If you need any help, contact support@craftyclicks.co.uk - we will help!
//
**********************************************************************************/
function CraftyClicksMagentoClass () {
	this.prefix = "";
	this.fields = { "postcode_id"	: "", // required
					"company_id"	: "", // optional
					"street1_id"	: "", // required
					"street2_id"	: "", // optional
					"street3_id"	: "", // optional
					"street4_id"	: "", // optional
					"town_id"		: "", // required
					"county_id"		: "", // optional
					"country_id"	: "", // required
					"telephone_id"	: ""  // required
					};

	this.current_setup			= 'initial'; // can be 'uk' or 'non_uk'
	this.uk_postcode_width		= '114px';
	this.old_postcode_width 	= '';
	this.cp_obj					= 0;
	this.change_field_order		= 1;

	this.elem_move = function(e1, e2) {
	    e1.insert({after : e2});
	}

	this.rearrange_fields = function() {
		var fields = this.fields;
		// check postcode field exists
		if (! $(fields.postcode_id)) return false;

		// postcode could be bundled with county
		if ($(fields.county_id).up('div', 1) == $(fields.postcode_id).up('div', 1).next() &&
			$(fields.county_id).up('div', 1).hasClassName('aw-onestepcheckout-general-form-field-right') &&
			$(fields.postcode_id).up('div', 1).hasClassName('aw-onestepcheckout-general-form-field-left')) {

			// move the county and postcode on its own lines
			$(fields.county_id).up('div', 1).removeClassName('aw-onestepcheckout-general-form-field-right');
			$(fields.county_id).up('div', 1).addClassName('aw-onestepcheckout-general-form-field-wide');
			$(fields.postcode_id).up('div', 1).removeClassName('aw-onestepcheckout-general-form-field-left');
			$(fields.postcode_id).up('div', 1).addClassName('aw-onestepcheckout-general-form-field-wide');
		}

		if ('' != $(fields.town_id).getValue()) {
			_cp_hide_fields = false;
		}

		// order for non-UK: country, company (if we have it), street1, street2, street3 (if we have it), town, county (if we have it), postcode
		var li_list = [ $(fields.country_id).up('div', 1) ];
		var idx = 1;

		var ne = $(fields.company_id);
		if (ne) {
			li_list[idx] = ne.up('div', 1); idx++;
			ne.up('div', 1).addClassName(this.prefix+'_cp_address_class');
		}

		li_list[idx] = $(fields.street1_id).up('div', 1); idx++;
		$(fields.street1_id).up('div', 1).addClassName(this.prefix+'_cp_address_class');
		ne = $(fields.street2_id);
		if (ne) {
			li_list[idx] = ne.up('div', 1);	idx++;
			ne.up('div', 1).addClassName(this.prefix+'_cp_address_class');
		}
		ne = $(fields.street3_id);
		if (ne) {
			li_list[idx] = ne.up('div', 1);	idx++;
			ne.up('div', 1).addClassName(this.prefix+'_cp_address_class');
		}
		ne = $(fields.street4_id);
		if (ne) {
			li_list[idx] = ne.up('div', 1);	idx++;
			ne.up('div', 1).addClassName(this.prefix+'_cp_address_class');
		}
		li_list[idx] = $(fields.town_id).up('div', 1); idx++;
		$(fields.town_id).up('div', 1).addClassName(this.prefix+'_cp_address_class');

		li_list[idx] = $(fields.county_id).up('div', 1); idx++;
		$(fields.county_id).up('div', 1).addClassName(this.prefix+'_cp_address_class');

		li_list[idx] = $(fields.postcode_id).up('div', 1); idx++;

        if (this.change_field_order) {
		    for (var ii = 0; ii < idx; ii++) {
			    this.elem_move(li_list[ii], li_list[ii+1]);
		    }
		}

/*
 		// shrink postcode field width, so the lookup button fits on the form next to the postcode field
		var pcWidth = parseInt($(this.fields.postcode_id).getStyle("width"));
		if (350 < pcWidth) {
			this.uk_postcode_width = '100px';
		}
*/
		return (true);
	}

	this.setup_for_uk = function() {
		// check if we need to do anything
		if ('uk' != this.current_setup) {
			// do the magic for UK
			// move postcode to the uk position after the country li
            if (this.change_field_order) {
    			$(this.fields.country_id).up('div', 1).insert(  {after: $(this.fields.postcode_id).up('div', 1)} );
    		}
			// add result box
			if (!$(this.prefix+'_cp_result_display')) {
				var tmp_html = '</div><div class="aw-onestepcheckout-general-form-field aw-onestepcheckout-general-form-field-wide" style="display: none"><label>&nbsp;</label><div class="input-box" id="'+this.prefix+'_cp_result_display">&nbsp;</div></div>';
				$(this.fields.postcode_id).up('div', 1).insert( {after: tmp_html} );
			}
			// show result box
			$(this.prefix+"_cp_result_display").up('div').show();
			// add button
			if (!$(this.prefix+'_cp_button_div_id')) {
				// postcode will be on its own by now...
				$(this.fields.postcode_id).up('div', 1).removeClassName('aw-onestepcheckout-general-form-field-wide');
				$(this.fields.postcode_id).up('div', 1).addClassName('aw-onestepcheckout-general-form-field-left');
				var tmp_html = '<div class="aw-onestepcheckout-general-form-field aw-onestepcheckout-general-form-field-right" id="'+this.prefix+'_cp_button_div_id"><label>&nbsp;</label><div class="input-box">';
				if ('' != _cp_button_image) {
					tmp_html += '<img style="cursor: pointer;" src="'+_cp_button_image+'" id="'+this.prefix+'_cp_button_id" class="'+_cp_button_class+'" title="'+_cp_button_text+'"/>';
				} else {
					tmp_html += '<button type="button" id="'+this.prefix+'_cp_button_id" class="'+_cp_button_class+'"><span><span>'+_cp_button_text+'</span></span></button>';
				}
				tmp_html += '</div><div style="clear:both;"></div></div>';

				$(this.fields.postcode_id).up('div', 1).insert( {after : tmp_html} );
				$(this.prefix+"_cp_button_id").observe('click', this.button_clicked.bindAsEventListener(this));
			}
			// show button
			$(this.prefix+"_cp_button_div_id").show();

			// shrink postcode field if needed
			if ('' != this.uk_postcode_width) {
				this.old_postcode_width = $(this.fields.postcode_id).getStyle("width");
				$(this.fields.postcode_id).setStyle({width: this.uk_postcode_width});
			}

			// hide county if requested (and if it exists in the html at all)
			if (_cp_hide_county) {
				ne = $(this.fields.county_id);
				if (ne) {
					ne.up('div', 1).hide();
				}
			}
		}

		if ('initial' == this.current_setup && _cp_hide_fields) {
			// first time and default to UK, hide address fields
			$$('.'+this.prefix+'_cp_address_class').invoke('hide');
		}

		// set state
		this.current_setup = 'uk';
	}

	this.setup_for_non_uk = function() {
		// check if we need to do anything
		if ('non_uk' != this.current_setup) {
			// hide result box (if it exist already)
			if ($(this.prefix+"_cp_result_display")) {
				this.cp_obj.update_res(null);
				$(this.prefix+"_cp_result_display").up('div').hide();
			}
			// hide button (if it exist already)
			if ($(this.prefix+"_cp_button_div_id")) {
				$(this.fields.postcode_id).up('div', 1).removeClassName('aw-onestepcheckout-general-form-field-left');
				$(this.fields.postcode_id).up('div', 1).addClassName('aw-onestepcheckout-general-form-field-wide');
				$(this.prefix+"_cp_button_div_id").remove();
			}
			// move postcode to the non-uk position after the town/county li
            if (this.change_field_order) {
    			$(this.fields.county_id).up('div', 1).insert(  {after: $(this.fields.postcode_id).up('div', 1)} );
    		}
			// restore postcode field width if needed
			if ('' != this.old_postcode_width) {
				$(this.fields.postcode_id).setStyle({width: this.old_postcode_width});
			}
			// show county if it was hidden (and exists in the html at all)
			if (_cp_hide_county) {
				ne = $(this.fields.county_id);
				if (ne) {
					ne.up('div', 1).show();
				}
			}

			// show all other addres lines
			$$('.'+this.prefix+'_cp_address_class').invoke('show');
			// set state
			this.current_setup = 'non_uk';
		}
	}

	this.add_lookup = function(setup) {
		cp_obj = CraftyPostcodeCreate();
		this.cp_obj = cp_obj;
	 	// config
	 	this.prefix = setup.prefix;
	 	this.fields = setup.fields;
		cp_obj.set("access_token", _cp_token_fe);
		cp_obj.set("res_autoselect", "0");
		cp_obj.set("result_elem_id", this.prefix+"_cp_result_display");
		cp_obj.set("form", "");
		cp_obj.set("elem_company"  , this.fields.company_id); // optional
		cp_obj.set("elem_street1"  , this.fields.street1_id);
		cp_obj.set("elem_street2"  , this.fields.street2_id);
		cp_obj.set("elem_street3"  , this.fields.street3_id);
		cp_obj.set("elem_town"     , this.fields.town_id);
		if (_cp_hide_county) {
			cp_obj.set("elem_county"   , ""); // optional
		} else {
			cp_obj.set("elem_county"   , this.fields.county_id); // optional
		}
		cp_obj.set("elem_postcode" , this.fields.postcode_id);
		cp_obj.set("single_res_autoselect" , 1); // don't show a drop down box if only one matching address is found
		cp_obj.set("max_width" , _cp_result_box_width);
		if (1 < _cp_result_box_height) {
			cp_obj.set("first_res_line", "");
			cp_obj.set("max_lines" , _cp_result_box_height);
		} else {
			cp_obj.set("first_res_line", "----- please select your address ----");
			cp_obj.set("max_lines" , 1);
		}
		cp_obj.set("busy_img_url" , _cp_busy_img_url);
		cp_obj.set("hide_result" , _cp_clear_result);
		cp_obj.set("traditional_county" , 1);
		cp_obj.set("on_result_ready", this.result_ready.bindAsEventListener(this));
		cp_obj.set("on_result_selected", this.result_selected.bindAsEventListener(this));
		cp_obj.set("on_error", this.result_error.bindAsEventListener(this));
		cp_obj.set("first_res_line", _cp_1st_res_line);
		cp_obj.set("err_msg1", _cp_err_msg1);
		cp_obj.set("err_msg2", _cp_err_msg2);
		cp_obj.set("err_msg3", _cp_err_msg3);
		cp_obj.set("err_msg4", _cp_err_msg4);
		// initial page setup
		if (this.rearrange_fields()) {
			if (_cp_enable_for_uk_only) {
				this.country_changed();
				$(this.fields.country_id).observe('change', this.country_changed.bindAsEventListener(this));
			} else {
				this.setup_for_uk();
			}
		} else {
//			alert ('Postcode Lookup could not be added!');
		}
	}

	this.country_changed = function(e) {
		// show postcode lookup for:
		// "GB" UK
		// "JE" Jersey
		// "GG" Guernsey
		// "IM" Isle of Man
		var curr_country = $(this.fields.country_id).getValue();
		if ('GB' == curr_country || 'JE' == curr_country || 'GG' == curr_country || 'IM' == curr_country) {
			this.setup_for_uk();
		} else {
			this.setup_for_non_uk();
		}
	}

	this.button_clicked = function(e) {
		if ('' != _cp_error_class) $(this.prefix+'_cp_result_display').removeClassName(_cp_error_class);
		this.cp_obj.doLookup();
	}

	this.result_ready = function() {
	}

	this.result_selected = function() {
		if (_cp_clear_result) this.cp_obj.update_res(null);
		$$('.'+this.prefix+'_cp_address_class').invoke('show');

		switch($(this.fields.postcode_id).getValue().substring(0,2)){
			case "GY":
				$(this.fields.country_id).setValue("GG");
				break;
			case "JE":
				$(this.fields.country_id).setValue("JE");
				break;
			case "IM":
				$(this.fields.country_id).setValue("IM");
				break;
			default:
				$(this.fields.country_id).setValue("GB");
				break;
		}
		$(this.fields.town_id).simulate('change');
	}

	this.result_error = function() {
		$$('.'+this.prefix+'_cp_address_class').invoke('show');
		if ('' != _cp_error_class) $(this.prefix+'_cp_result_display').addClassName(_cp_error_class);
	}
}

document.observe("dom:loaded", function() {

	if (!_cp_integrate) return;

	if ($("billing:postcode")) {
		var cc1 = new CraftyClicksMagentoClass();
		cc1.add_lookup({
		"prefix"				: "billing",
		"fields"				: { "postcode_id" : "billing:postcode",
									"company_id"  : "billing:company",
									"street1_id"  : "billing:street1",
									"street2_id"  : "billing:street2",
									"street3_id"  : "billing:street3",
									"street4_id"  : "billing:street4",
									"town_id"	  : "billing:city",
									"county_id"   : "billing:region",
									"country_id"  : "billing:country_id",
									"telephone_id": "billing:telephone" }
		});
	}

	if ($("shipping:postcode")) {
		var cc2 = new CraftyClicksMagentoClass();
		cc2.add_lookup({
		"prefix"				: "shipping",
		"fields"				: { "postcode_id" : "shipping:postcode",
									"company_id"  : "shipping:company",
									"street1_id"  : "shipping:street1",
									"street2_id"  : "shipping:street2",
									"street3_id"  : "shipping:street3",
									"street4_id"  : "shipping:street4",
									"town_id"	  : "shipping:city",
									"county_id"   : "shipping:region",
									"country_id"  : "shipping:country_id",
									"telephone_id": "shipping:telephone" }
		});
	}

	if ($("zip")) {
		var cc3 = new CraftyClicksMagentoClass();
		cc3.add_lookup({
		"prefix"				: "",
		"fields"				: { "postcode_id" : "zip",
									"company_id"  : "company",
									"street1_id"  : "street_1",
									"street2_id"  : "street_2",
									"street3_id"  : "street_3",
									"street4_id"  : "street_4",
									"town_id"	  : "city",
									"county_id"   : "region",
									"country_id"  : "country",
									"telephone_id": "telephone" }
		});
	}

});

/**
 * Event.simulate(@element, eventName[, options]) -> Element
 *
 * - @element: element to fire event on
 * - eventName: name of event to fire (only MouseEvents and HTMLEvents interfaces are supported)
 * - options: optional object to fine-tune event properties - pointerX, pointerY, ctrlKey, etc.
 *
 *    $('foo').simulate('click'); // => fires "click" event on an element with id=foo
 *
 **/
(function(){

  var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
  }
  var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
  }

  Event.simulate = function(element, eventName) {
    var options = Object.extend(Object.clone(defaultOptions), arguments[2] || { });
    var oEvent, eventType = null;

    element = $(element);

    for (var name in eventMatchers) {
      if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
      throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent) {
      oEvent = document.createEvent(eventType);
      if (eventType == 'HTMLEvents') {
        oEvent.initEvent(eventName, options.bubbles, options.cancelable);
      }
      else {
        oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
          options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
          options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
      }
      element.dispatchEvent(oEvent);
    }
    else {
      options.clientX = options.pointerX;
      options.clientY = options.pointerY;
      oEvent = Object.extend(document.createEventObject(), options);
      element.fireEvent('on' + eventName, oEvent);
    }
    return element;
  }

  Element.addMethods({ simulate: Event.simulate });
})();
