if(typeof jQuery !== 'undefined')
	jQuery.noConflict();

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
					"email_id"		: ""  // required
					};

	this.current_setup			= 'initial'; // can be 'uk' or 'non_uk'
	this.uk_postcode_width		= ''
	this.old_postcode_width 	= '';
	this.cp_obj					= 0;
	this.div_depth				= 0;
	this.li_class 				= '';
	this.mw_opc					= false;
	
	this.elem_move = function(e1, e2) {
	    e1.insert({after : e2}); 
	}

	// test div depth - some magento temlates wrap fields in two layers of div in a li
	this.set_div_depth = function() {
		if ($(this.fields.postcode_id).up('div', 1).descendantOf($(this.fields.postcode_id).up('li'))) {
			this.div_depth = 1;
		}
	}
	
	this.rearrange_fields = function() {
		var fields = this.fields;		
		
		// postcode should be bundled with country in the same li on the standard magento address templates
		// if this isn't the case, the rest of this code unlikely to work!
			
		if ('' != $(fields.town_id).getValue()) {
			_cp_hide_fields = false;
		}
		
		// order for non-UK: country, company (if we have it), street1, street2, street3 (if we have it), town, county (if we have it), postcode
		var li_list = [ $(fields.country_id).up('li') ];
		var idx = 1;

		var ne = $(fields.company_id);
		if (ne) {			
			li_list[idx] = ne.up('li'); idx++;
			ne.up('li').addClassName(this.prefix+'_cp_address_class');
		}

		li_list[idx] = $(fields.street1_id).up('li'); idx++;
		$(fields.street1_id).up('li').addClassName(this.prefix+'_cp_address_class');
		ne = $(fields.street2_id);
		if (ne) {
			li_list[idx] = ne.up('li');	idx++;
			ne.up('li').addClassName(this.prefix+'_cp_address_class');
		}
		ne = $(fields.street3_id);
		if (ne) {
			li_list[idx] = ne.up('li');	idx++;
			ne.up('li').addClassName(this.prefix+'_cp_address_class');
		}
		ne = $(fields.street4_id);
		if (ne) {
			li_list[idx] = ne.up('li');	idx++;
			ne.up('li').addClassName(this.prefix+'_cp_address_class');
		}
		li_list[idx] = $(fields.town_id).up('li'); idx++;  // town and county are on the same li, so will move together
		$(fields.town_id).up('li').addClassName(this.prefix+'_cp_address_class');


		li_list[idx] = $(fields.county_id).up('li'); idx++; 
		li_list[idx] = $(fields.postcode_id).up('li'); idx++;

		for (var ii = 0; ii < idx; ii++) {
			this.elem_move(li_list[ii], li_list[ii+1]); 
		}
		// create a new li to hold the postcode on its own
		//$(fields.town_id).up('li').insert( {after: '<li class="'+this.li_class+'" id="'+this.prefix+'_cp_postcode_placeholder_id"></li>'} );
		
		//$(this.prefix+"_cp_postcode_placeholder_id").insert( $(this.fields.postcode_id).up('div', this.div_depth) );

		// check postcode field width, longer than 350px means we are on a magento enterprise template and we need to shrink things a bit
		// so the lookup button fits on the form next to the postcode field
		var pcWidth = parseInt($(this.fields.postcode_id).getStyle("width"));
		if (350 < pcWidth || _cp_button_fixposition) {
			this.uk_postcode_width = '100px';
		}
		/*
		// move the telephone above the address - we move it only if we hide other address fields
		ne = $(fields.telephone_id);
		if (_cp_hide_fields && ne) {
			// telephone may be bundled with company, if so separate it out
			if ($(fields.company_id) && ne.up('li') == $(fields.company_id).up('li')) {
				// create a new li to hold the telephone on its own at the top of the address
				$(fields.country_id).up('li').insert( {before: '<li class="'+this.li_class+'" id="'+this.prefix+'_telephone_placeholder_id"></li>'} );
				$(this.prefix+"_telephone_placeholder_id").insert( ne.up('div', this.div_depth) );
			} else {
				// telephone is probably on its own, or with fax
				$(fields.country_id).up('li').insert({before : ne.up('li')});  
			}
		}
		*/
		return (true);
		
	}

	this.setup_for_uk = function() {
		// check if we need to do anything
		if ('uk' != this.current_setup) {
			// do the magic for UK
			
			// move postcode to the uk position after the country li
			$(this.fields.country_id).up('li').insert(  {after: $(this.fields.postcode_id).up('li')} );
			// add result box
			if (!$(this.prefix+'_cp_result_display')) {
				var tmp_html = '<li class="'+this.li_class+'" style="display: none"><div class="input-box" id="'+this.prefix+'_cp_result_display">&nbsp;</div></li>';
				$(this.fields.postcode_id).up('li').insert( {after: tmp_html} );
			}
			// show result box
			//$(this.prefix+"_cp_result_display").up('li').show();
			// add button
			if (!$(this.prefix+'_cp_button_div_id')) {
				var tmp_html = '';
				if (0 == this.div_depth) {
					tmp_html = '<div class="input-box" id="'+this.prefix+'_cp_button_div_id">';
				} else {
					tmp_html = '<div class="field" id="'+this.prefix+'_cp_button_div_id"><div class="input-box">';
				}
				if ('' != _cp_button_image) {
					tmp_html += '<img style="cursor: pointer;" src="'+_cp_button_image+'" id="'+this.prefix+'_cp_button_id" class="'+_cp_button_class+'" title="'+_cp_button_text+'"/>';
				} else {
					tmp_html += '<button type="button" id="'+this.prefix+'_cp_button_id" class="'+_cp_button_class+'" style="height:100%; padding: 6px 6px; margin: 2px 5px;"><span><span>'+_cp_button_text+'</span></span></button>';
				}
				if (0 == this.div_depth) {
					tmp_html += '</div>';
				} else {
					tmp_html += '</div></div>';
				}
				$(this.fields.postcode_id).up('div', this.div_depth).insert( {after : tmp_html} );
				$(this.prefix+"_cp_button_id").observe('click', this.button_clicked.bindAsEventListener(this));
			}
			
			// shrink postcode field if needed
			if ('' != this.uk_postcode_width) {
				this.old_postcode_width = $(this.fields.postcode_id).getStyle("width");
				$(this.fields.postcode_id).setStyle({width: this.uk_postcode_width});
			}

			// show button
			$(this.prefix+"_cp_button_div_id").show();

			// hide county if requested (and if it exists in the html at all)
			if (_cp_hide_county) {
				ne = $(this.fields.county_id);
				if (ne) {
					ne.up('div', this.div_depth+1).hide();
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
				$(this.prefix+"_cp_result_display").up('li').hide();
			}
			// hide button (if it exist already)
			if ($(this.prefix+"_cp_button_div_id")) {
				$(this.prefix+"_cp_button_div_id").hide();
			}
			$(this.fields.street2_id).up('li').insert(  {after: $(this.fields.postcode_id).up('li')} );
			
			// restore postcode field width if needed
			if ('' != this.old_postcode_width) {
				$(this.fields.postcode_id).setStyle({width: this.old_postcode_width});
			}
			// show county if it was hidden (and exists in the html at all)
			if (_cp_hide_county) {
				ne = $(this.fields.county_id);
				if (ne) {
					ne.up('.state').show();
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
		this.set_div_depth();
		if (this.rearrange_fields()) {
			if (_cp_enable_for_uk_only) {
				this.country_changed();
				//$(this.fields.country_id).observe('change', this.country_changed.bindAsEventListener(this));
				jQuery(jq(this.fields.country_id)).on('change',this.country_changed.bindAsEventListener(this));
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
		$(this.prefix+"_cp_result_display").up('li').show();
	}
	
	this.result_ready = function() {
	}
		
	this.result_selected = function() {
		if (_cp_clear_result) this.cp_obj.update_res(null);
		$$('.'+this.prefix+'_cp_address_class').invoke('show');
		$(this.prefix+"_cp_result_display").up('li').hide();

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
	}
	
	this.result_error = function() { 
		$$('.'+this.prefix+'_cp_address_class').invoke('show');
		if ('' != _cp_error_class) $(this.prefix+'_cp_result_display').addClassName(_cp_error_class);
	}
}

document.observe("dom:loaded", function(){_cp_init_lookup();});

function _cp_init_lookup() {

	if (!_cp_integrate) return;
	
	setInterval(function(){
		if($("billing:postcode") && !$$('.billing_cp_address_class').length != 0){
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
											"email_id"    : "billing:email",
											"telephone_id": "billing:telephone" }
				});
		}
		if ($("shipping:postcode") && !$$('.shipping_cp_address_class').length != 0) {
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
											"email_id"    : "shipping:email",
											"telephone_id": "shipping:telephone" }
				});
			}

	},250);
		
	
if
	 ($("zip")) {
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
									"email_id"    : "email_address",
									"telephone_id": "telephone" }
		});
	}

	// preload the busy img
	if ('' != _cp_busy_img_url) {
		var image = new Image();
		image.src = _cp_busy_img_url;
	}
}

