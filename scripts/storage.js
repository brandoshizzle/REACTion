/**
 *	@desc: 	Loads the keyInfo array from localStorage and registers each sound
 *					Also prints the name of the song on the key in the view
 *	@param: none
 */
function getInfoObj(objName) {
	var tempObj = {};
	// Pull keyInfo string from localStorage
	var infoString = localStorage.getItem(objName);
	// Only parse it if it exists!
	if (infoString !== null) {
		tempObj = JSON.parse(infoString);
		Object.keys(tempObj).map(function(id, index) {
			// Ensure all parameters are up to date
			util.checkKeyInfo(tempObj[id].id);
			blog(tempObj[id].id);
			// Print the name of each sound on it's corresponding key
			$("#" + tempObj[id].id).text(tempObj[id].name);
			// Register sound with SoundJS
			sounds.register(tempObj[id]);
		});
	}
	return tempObj;
}

/**
 *	@desc: Save changed object to local storage
 *	@param: keyName: The name of the localStorage object
 *					obj : The object being stringified and stored
 */
function storeObj(keyName, obj) {
	var objString = JSON.stringify(obj);
	localStorage.setItem(keyName, objString);
	blog("Stored new " + keyName + " settings!");
}

module.exports = {
	getInfoObj: getInfoObj,
	storeObj: storeObj
};
