<?php
$crafty_script_added = false;
function crafty_add_address_finder($obj, $suffix = '', $company_id = 'company', $street_id = 'street_', $town_id='city', $county_id='region', $postcode_id = 'zip', $country_id = '_cp_country') {
	global $crafty_script_added;
	$conf = Mage::getStoreConfig('general');		
	
	if (1 == $conf['craftyclicks']['active']) {
	
		if (false == $crafty_script_added) {
			echo "<script type=\"text/javascript\" charset=\"ISO-8859-1\" src=\"".$obj->getJsUrl('crafty/crafty_postcode.js')."\"></script>\n";
			$crafty_script_added = true;
		}

		echo "<script type=\"text/javascript\">";
		
		if (1 == $conf['craftyclicks']['hide_fields'] && '' == $obj->getAddress()->getPostcode()) {
			// hide address fields if they are blank, only show them once an address is selected
			echo "
			function _cp_set_addr_fields_display".$suffix."(new_display) {
				document.getElementById('".$town_id."').parentNode.parentNode.style.display = new_display;
				if (document.getElementById('".$company_id."')) {
					document.getElementById('".$company_id."').parentNode.style.display = new_display;
				}";
			// do all street lines
			for ($street_num = 1; $street_num<=$obj->helper('customer/address')->getStreetLines(); $street_num++) {
				echo "
				document.getElementById('".$street_id.$street_num."').parentNode.style.display = new_display;";
			}
			echo "
			}
			// hide all address lines 
			_cp_set_addr_fields_display".$suffix."('none');

			function _cp_addr_fields_show".$suffix."() {
				_cp_set_addr_fields_display".$suffix."('block');
			}
			";
		} else {
			echo "
			function _cp_addr_fields_show".$suffix."() {
				// stub
			}
			";
		}
		if (1 == $conf['craftyclicks']['clear_result']) {
			echo "
			function _cp_addr_result_hide".$suffix."() {
				cp_obj".$suffix.".update_res(null);
				document.getElementById('crafty_postcode_result_display".$suffix."').style.display = 'none'; 
			}
			";
		} else {
			echo "
			function _cp_addr_result_hide".$suffix."() {
				//STUB
			}
			";
		}

		if (1 == $conf['craftyclicks']['hide_county']) {
			echo "
			function _cp_county_display".$suffix."(new_display) {
				var county_filed = document.getElementById('".$county_id."').parentNode;
				if (county_filed) {
					county_filed.style.display = new_display;
				} 
			}
			";
		} else {
			echo "
			function _cp_county_display".$suffix."(dummy) {
				//STUB
			}
			";
		}

		echo "
		function _cp_result_ready".$suffix."() {
			_cp_addr_fields_show".$suffix."();
		}
		
		function _cp_result_selected".$suffix."() {
			_cp_addr_result_hide".$suffix."();
		}
		function _cp_result_error".$suffix."() {
			_cp_addr_fields_show".$suffix."();";
			
			if (array_key_exists('error_class',$conf['craftyclicks']) && '' != $conf['craftyclicks']['error_class']) {
				echo "			document.getElementById('crafty_postcode_result_display".$suffix."').className = '".$conf['craftyclicks']['error_class']."';";
			}
		echo "		}
		function _cp_country_handler".$suffix."() {
			if ('GB' != document.getElementById('".$country_id."').value) {
				document.getElementById('".$postcode_id."').style.width = _cp_oldZipWidth".$suffix.";
				document.getElementById('zipDiv').style.width = _cp_oldZipDivWidth".$suffix.";
				document.getElementById('findAddrBtnDiv".$suffix."').style.display = 'none'; 
				document.getElementById('crafty_postcode_result_display".$suffix."').style.display = 'none'; 
				_cp_addr_fields_show".$suffix."();
				cp_obj".$suffix.".update_res(null);
				_cp_county_display".$suffix."('inline');
			} else {
				document.getElementById('".$postcode_id."').style.width = '135px';
				document.getElementById('zipDiv".$suffix."').style.width = '150px';
				document.getElementById('findAddrBtnDiv".$suffix."').style.width = '125px';
				document.getElementById('findAddrBtnDiv".$suffix."').style.display = 'inline'; 
				_cp_county_display".$suffix."('none');
			}
		}
		function _cp_do_lookup".$suffix."()
		{
			document.getElementById('crafty_postcode_result_display".$suffix."').className = '';
			document.getElementById('crafty_postcode_result_display".$suffix."').style.display = 'inline'; 
			cp_obj".$suffix.".doLookup();
		}
			
		var _cp_oldZipWidth".$suffix." = document.getElementById('". $postcode_id."').style.width; 
		var _cp_oldZipDivWidth".$suffix." = document.getElementById('zipDiv').style.width; 
		var _cp_countryElem".$suffix." = document.getElementById('".$country_id."');
		
        Event.observe(_cp_countryElem".$suffix.", 'change',  _cp_country_handler".$suffix.");
        Event.observe(_cp_countryElem".$suffix.", 'click',  _cp_country_handler".$suffix.");
        Event.observe(_cp_countryElem".$suffix.", 'keypress',  _cp_country_handler".$suffix.");

		_cp_country_handler".$suffix."();	
	
		var cp_obj".$suffix." = CraftyPostcodeCreate();
		cp_obj".$suffix.".set('max_width', '530px');
		cp_obj".$suffix.".set('access_token', '".$conf['craftyclicks']['access_token']."'); 
		cp_obj".$suffix.".set('result_elem_id', 'crafty_postcode_result_display".$suffix."');
		cp_obj".$suffix.".set('form', '');";

		$element_ids = $company_id.',';
		for ($streetNum = 1; $streetNum<=3; $streetNum++) {
			if ($streetNum<=$obj->helper('customer/address')->getStreetLines()) {
				$element_ids.= $street_id.$streetNum.',';
			} else {
				$element_ids.= ',';
			}
		}
		$element_ids.=$town_id.','.$county_id.','.$postcode_id;

		echo "
		cp_obj".$suffix.".set('elements', '".$element_ids."');
		cp_obj".$suffix.".set('res_autoselect', '0');
		cp_obj".$suffix.".set('busy_img_url', '".$obj->getSkinUrl('craftyclicks/crafty_postcode_busy.gif')."');
		cp_obj".$suffix.".set('on_result_ready', _cp_result_ready".$suffix.");
		cp_obj".$suffix.".set('on_result_selected', _cp_result_selected".$suffix.");
		cp_obj".$suffix.".set('on_error', _cp_result_error".$suffix.");
		";
		if (array_key_exists('first_res_line',$conf['craftyclicks']) && '' != $conf['craftyclicks']['first_res_line']) {
			echo "		cp_obj".$suffix.".set('first_res_line', '".$conf['craftyclicks']['first_res_line']."');";
		}
		if (array_key_exists('error_msg_1',$conf['craftyclicks']) && '' != $conf['craftyclicks']['error_msg_1']) {
			echo "		cp_obj".$suffix.".set('err_msg1', '".$conf['craftyclicks']['error_msg_1']."');";
		}
		if (array_key_exists('error_msg_2',$conf['craftyclicks']) && '' != $conf['craftyclicks']['error_msg_2']) {
			echo "		cp_obj".$suffix.".set('err_msg2', '".$conf['craftyclicks']['error_msg_2']."');";
		}
		if (array_key_exists('error_msg_3',$conf['craftyclicks']) && '' != $conf['craftyclicks']['error_msg_3']) {
			echo "		cp_obj".$suffix.".set('err_msg3', '".$conf['craftyclicks']['error_msg_3']."');";
		}
		if (array_key_exists('error_msg_4',$conf['craftyclicks']) && '' != $conf['craftyclicks']['error_msg_4']) {
			echo "		cp_obj".$suffix.".set('err_msg4', '".$conf['craftyclicks']['error_msg_4']."');";
		}
		echo "
		</script>";
	} 
}
?>