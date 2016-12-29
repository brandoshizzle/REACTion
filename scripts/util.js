/**
 *	Utility functions
 * These functions deal with minor tasks and data handling mostly
 * Functions:
 *		storeObj, checkKeyInfo, loadKeyInfo, cleanName
 */

const dialog = require('electron').remote.dialog;

/**
 *	@desc: Save changed object to local storage
 *	@param: keyName: The name of the localStorage object
 *					obj : The object being stringified and stored
 */
function storeObj(keyName, obj) {
	var objString = JSON.stringify(obj);
	localStorage.setItem(keyName, objString);
	console.log("Stored new " + keyName + " settings!");
}

/**
 *	@desc: Ensures that all loaded keys have the properties they need
 *				Called when loading stored keyInfo and when a song is dragged onto a key
 *	@param: key: The letter (or character) of the key to check (string)
 */
function checkKeyInfo(key) {
	var chosenKey = keyInfo[key];
	// Define the default array - any new properties need to be added here!
	var defaultArray = {
		"key": key,
		"name": "",
		"path": "",
		"color": "default",
		"loop": false,
		"startTime": 0,
		"endTime": null
	};

	if (chosenKey == undefined) { // If that key isn't part of the keyInfo array yet...
		keyInfo[key] = JSON.parse(JSON.stringify(defaultArray));
	} else { // If key was already defined...
		// Check that the key has all properties - set default if it doesn't have it.
		Object.keys(
			defaultArray).map(function(prop, index) {
			if (!keyInfo[key].hasOwnProperty(prop)) {
				keyInfo[key][prop] = defaultArray[prop];
			}
		});

		// Check that the key does not have depreciated properties (and delete them)
		Object.keys(chosenKey).map(function(prop, index) {
			if (!defaultArray.hasOwnProperty(prop)) {
				delete keyInfo[key][prop];
			}
		});

	}
}

/**
 *	@desc: 	Loads the keyInfo array from localStorage and registers each sound
 *					Also prints the name of the song on the key in the view
 *	@param: none
 */
function loadKeyInfo() {
	// Pull keyInfo string from localStorage
	var keyInfoString = localStorage.getItem("keyInfo");
	// Only parse it if it exists!
	if (keyInfoString != null) {
		keyInfo = JSON.parse(keyInfoString);
		console.log(keyInfo);
		Object.keys(keyInfo).map(function(key, index) {
			// Ensure all parameters are up to date
			checkKeyInfo(key);
			// Print the name of each sound on it's corresponding key
			$("#" + key).text(keyInfo[key].name);
			// Register sound with SoundJS
			sounds.register(key);
		});
	}
}

/**
 *	@desc: Creates the default name for a new song dragged in
 *	@param: name: The uncleaned file name
 *	@return: The initial name without the file type ending
 */
function cleanName(name) {
	name = name.toString();
	var pos = name.lastIndexOf("\\");
	if (pos > -1) {
		name = name.substring(pos + 1);
	}
	pos = name.lastIndexOf(".");
	return name.substring(0, pos);
}

function openBrowse() {
	var currentPath = $('#sound-settings-path').val();
	var options = {
		title: 'Replace Sound File',
		defaultPath: currentPath,
		filters: [{
			name: '*.wav, *.mp3, *.m4a, *.wma',
			extensions: ['wav', 'mp3', 'ogg', 'm4a', 'mp4', 'wma']
		}],
		properties: ['openFile']
	};
	var newPath = dialog.showOpenDialog(options);
	if (newPath != null) {
		$('#sound-settings-path').val(newPath);
		$('#sound-settings-name').text(cleanName(newPath));
	}
}

function startTime() {
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();
	var ampm = 'AM';
	m = checkTime(m);
	s = checkTime(s);
	if (h > 12) {
		h -= 12;
		ampm = 'PM';
	}
	$('#clock').text(h + ":" + m + ":" + s + " " + ampm);
	var t = setTimeout(startTime, 500);
}

function checkTime(i) {
	if (i < 10) {
		i = "0" + i
	}; // add zero in front of numbers < 10
	return i;
}


module.exports = {
	storeObj: storeObj,
	checkKeyInfo: checkKeyInfo,
	loadKeyInfo: loadKeyInfo,
	cleanName: cleanName,
	startTime: startTime,
	openBrowse: openBrowse
}
