/**
 *	Utility functions
 * These functions deal with minor tasks and data handling mostly
 * Functions:
 *		storeObj, checkKeyInfo, loadKeyInfo, cleanName
 */
/*jshint esversion: 6 */
const dialog = require('electron').remote.dialog;

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

function prepareForId(str) {
	var replaced = str.replace(/ /g, '_').replace(/[{()}]/g, '').replace(/[&]/g, 'and');
	return replaced;
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
	if (newPath !== null) {
		$('#sound-settings-path').val(newPath);
		$('#sound-settings-name').text(cleanName(newPath));
	}
}

function startClock() {
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();
	var ampm = 'AM';
	m = checkClock(m);
	s = checkClock(s);
	if (h > 11) {
		ampm = 'PM';
	}
	if (h > 12) {
		h -= 12;
	}
	$('#clock').text(h + ":" + m + ":" + s + " " + ampm);
	var t = setTimeout(startClock, 500);
}

function checkClock(i) {
	if (i < 10) {
		i = "0" + i;
	} // add zero in front of numbers < 10
	return i;
}

function cloneObj(obj) {
	return JSON.parse(JSON.stringify(obj));
}


module.exports = {
	cleanName: cleanName,
	prepareForId: prepareForId,
	startClock: startClock,
	openBrowse: openBrowse,
	cloneObj: cloneObj
};
