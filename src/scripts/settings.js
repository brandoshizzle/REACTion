var defaultSettings = {
	"playlistSoundToBottomAfterPlay": true,
	"playlistSoundDeleteAfterPlay": false
};

// Open settings modal
function openSettings() {
	$('#settings-playlistSoundToBottom').prop('checked', settings.playlistSoundToBottomAfterPlay);
	$('#settings-playlistSoundToDelete').prop('checked', settings.playlistSoundDeleteAfterPlay);
	$('#settings-modal').modal('open');
}

function saveSettings(){
	settings.playlistSoundToBottomAfterPlay = $('#settings-playlistSoundToBottom').prop('checked');
	settings.playlistSoundDeleteAfterPlay = $('#settings-playlistSoundToDelete').prop('checked');
	storage.storeObj('settings', settings);
}

// Check and update settings on import
function checkSettings(settingsObj) {
	Object.keys(defaultSettings).map(function(prop, index) {
		if (!settingsObj.hasOwnProperty(prop)) {
			settingsObj[prop] = defaultSettings[prop];
		}
	});
	// Check that the key does not have depreciated properties (and delete them)
	Object.keys(settingsObj).map(function(prop, index) {
		if (!defaultSettings.hasOwnProperty(prop)) {
			delete settingsObj[prop];
		}
	});
}

module.exports = {
	openSettings: openSettings,
	saveSettings: saveSettings,
	checkSettings: checkSettings
};
