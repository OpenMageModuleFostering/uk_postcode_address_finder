<?php

$configAccess = new Mage_Core_Model_Config();
$oldCfg = Mage::getStoreConfig('general');

if(isset($oldCfg['craftyclicks'])){
	//old plugin was set

	// STEP 1: Take cfg over
	if(!($oldCfg['craftyclicks']['access_token'] == 'xxxxx-xxxxx-xxxxx-xxxxx' && $oldCfg['craftyclicks']['access_token_admin_panel'] == 'xxxxx-xxxxx-xxxxx-xxxxx')){
		//old plugin didn't had default values.
		//transfer old config into new one.
		$values = array("active",
			"active_admin_panel",
			"access_token",
			"access_token_admin_panel",
			"button_image",
			"button_class",
			"hide_fields",
			"hide_county",
			"clear_result",
			"error_class",
			"max_res_lines",
			"first_res_line",
			"error_msg_1",
			"error_msg_2",
			"error_msg_3",
			"error_msg_4",
			"button_fixposition");
		$data = array();
		//check if every old cfg exists. (some older versions might not have all of these options)
		foreach($values as $val){
			if(isset($oldCfg['craftyclicks'][$val])){
				$data[$val] = $oldCfg['craftyclicks'][$val];
			}
		}
		foreach($data as $k=>$v){
			$configAccess->saveConfig('clicktoaddress/general/'.$k,$v, 'default', 0);
		}
	}
}
?>