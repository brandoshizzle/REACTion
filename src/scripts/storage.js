/*	STORAGE.JS
 *	Handles all stroring and retreiving of information from localStorage
 */

/*jshint esversion: 6 */
const soundInfoManager = require("./soundInfoManager");
const jetpack = require('fs-jetpack');
const app = require('electron').remote.app;

var appDir = app.getPath('userData');
$(function(){
	jetpack.dir(appDir).dir('data');
});
var dataDir = appDir + '\\data\\';

/**
 *	@desc: 	Loads an info object from JSON data and registers each sound
 *					Also prints the name of the song on the key in the view or creates
 *					a playlist item. Uses localStorage if it can't find JSON, returns an
 *					empty array if nothing is found
 *	@param: objName: Either 'keyInfo' or 'playlistInfo' (string)
 						obj: The actual object of objName
 */
function getInfoObj(objName, obj) {
	var tempObj = {};
	var objPath = dataDir + objName + '.json';
	// Use JSON storage if it exists, otherwise pull from (legacy) localStorage
	if(jetpack.exists(objPath)){
		tempObj = JSON.parse(jetpack.read(objPath));
	} else {
		console.log(objName + '.json does not exist. Using localStorage instead.');
		// Pull keyInfo string from localStorage
		var infoString = localStorage.getItem(objName);
		// Only parse it if it exists!
		if (infoString !== null) {
			tempObj = JSON.parse(infoString);
		}
	}
	return tempObj; // Return the sucker
}

/**
 *	@desc: Save changed object to local storage
 *	@param: keyName: The name of the localStorage object
 *					obj : The object being stringified and stored
 */
function storeObj(objName, obj) {
	console.log(dataDir + objName);
	jetpack.writeAsync(dataDir + objName + '.json', obj, {
		atomic: true
	});
	console.log('Storing new ' + objName + ' to json.');
	/* Old localStorage
		var objString = JSON.stringify(obj);
		localStorage.setItem(keyName, objString);
		blog("Stored new " + keyName + " settings!");
	} */
}

function deleteObj(objName){
	jetpack.remove(dataDir + objName + '.json');
}

module.exports = {
	getInfoObj: getInfoObj,
	storeObj: storeObj,
	deleteObj: deleteObj
};
