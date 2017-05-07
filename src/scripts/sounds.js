/*	SOUNDS.JS
 *	These functions deal with anything related to the audio engine
 */
/*jshint esversion: 6 */

var playlistPlayingSoundInfo;
var firstPlaylistSound;
var loadedCount = 0;
var stopping = 0;

/**
 *	@desc:	Checks whether the sound path is valid and registers it with Hower
 *					Sounds that fail the path check get the soundNotLoaded class
 *	@param:	soundInfo: Object containing info related to the sound object
 */
function registerSound(soundInfo) {
	// Check if path to sound file exists
	if (fs.existsSync(soundInfo.path)) {
		// Register sound with Howler
		soundInfo.howl = new Howl({
		  src: [soundInfo.path],
		  loop: soundInfo.loop,
			html5: true,
			/*sprite:{
				sound:[soundInfo.startTime, 5000]
			},*/
		  onend: function() {
		    console.log('Finished!');
				stop(soundInfo);
		  },
			onload: function(){
				//console.log('Loaded ' + soundInfo.name);
				console.log('oh boy here we go');
				if(soundInfo.endTime === null){
					soundInfo.endTime = soundInfo.howl.duration();
				}
				var spriteDuration = soundInfo.endTime - soundInfo.startTime;
				/*soundInfo.howl.sprite = {
					sound: [soundInfo.startTime, spriteDuration, soundInfo.loop]
				};*/

				loadedCount++;
				var loadedPercent = (loadedCount/totalNumSounds)*100 + "%";
				$('#loadedCount').width(loadedPercent);
				if(loadedCount === totalNumSounds){
					$('#loadedContainer').css('display', 'none');
				}
			},
			onplay: function(){
				var fadeTime = getFadeTime(soundInfo, 'in');
				console.log(fadeTime);
				if(fadeTime >= 0){
					soundInfo.fadeIn();
				}
				soundInfo.paused = false;
				soundInfo.endCheck = setInterval(function(){
					if(soundInfo.atEnding()){
						clearInterval(soundInfo.endCheck);
						soundInfo.fadeOut();
					}
				}, 50);
			},
			onpause: function(){
				soundInfo.paused = true;
				clearInterval(soundInfo.endCheck);
			},
			onstop: function(){
				console.log('stopped');
				soundInfo.paused = false;
				clearInterval(soundInfo.fadeInterval);
				clearInterval(soundInfo.endCheck);
				soundInfo.howl.seek(soundInfo.startTime);
				wavesurfer.seekTo(soundInfo.startTime/soundInfo.howl.duration());
			},
			/*
			onfade: function(){
				if(stopping){
					stop(soundInfo);
					stopping = false;
				}
			}*/
		});



	} else {
		// Let the user know with a toast
		Materialize.toast(soundInfo.name + " was not found.", 3000);
		$("#" + soundInfo.id).addClass("soundNotLoaded");
	}
}

/**
 *	@desc:	Plays a sound, creating a sound instance for it if necessary
 *	@param:	soundInfo: Object containing all sound information
 */
function playSound(soundInfo) {
	if (soundInfo.endTime == "0.00" || soundInfo.endTime == null) {
		soundInfo.endTime = sounds.getDuration(soundInfo);
	}
	if(settingsInfo.general.stopSounds === true){
		//soundInfo.soundInstance.paused = false;
	}
	// Check currentInstances to see if the key is playing or not
	// REMOVED IN V0.3.0
	/*if (soundInfo.soundInstance === undefined) { // in case it doesn't exist
		blog('Creating and playing new instance.');
		play();
		// Song is currently playing - stop it.
	} else */ if (soundInfo.howl.playing() /*&& !soundInfo.paused === false*/) {
		soundInfo.fadeOut();
		//stop(soundInfo);
		// Song is not playing, so play it.
	} else {
		//var ppc = setPPC(soundInfo); // Set play properties
		play();
	}

	function play() {
		if(soundInfo.infoObj === 'playlist'){
			if(playlistPlayingSoundInfo !== undefined){
				stop(playlistPlayingSoundInfo);
				return;
			}
			playlistPlayingSoundInfo = soundInfo;
		}
		// Sound is not paused, play it
		console.log(soundInfo.endTime);
		if(!soundInfo.paused){
			soundInfo.howl.seek(soundInfo.startTime);
		}
		var fadeTime = getFadeTime(soundInfo, 'in');
		soundInfo.howl.volume((fadeTime > 0) ? 0 : 1);
		soundInfo.howl.play();
		//reloadSound = false;
		waveforms.track(soundInfo);
		$('#' + soundInfo.id).removeClass('played');
		$('#' + soundInfo.id).addClass('playing-sound');
	}
}

function stop(soundInfo){
	if(!settingsInfo.general.stopSounds && !soundInfo.atEnding()){
		soundInfo.howl.pause();
	} else {
		soundInfo.howl.stop();
		soundInfo.howl.seek(soundInfo.startTime);
	}
	waveforms.track(soundInfo, true);
	$('#' + soundInfo.id).removeClass('playing-sound');
	if(settingsInfo.general.markPlayed){
		$('#' + soundInfo.id).addClass('played');
	}
	// If the song is stopped in the playlist
	if (soundInfo.infoObj === "playlist") {
		playlistPlayingSoundInfo = undefined;
		if(settingsInfo.playlist.soundDeleteAfterPlay){
			delete playlistInfo[soundInfo.id];
			$("#" + soundInfo.id).remove();
			storage.storeObj("playlistInfo", playlistInfo);
		}	else if(settingsInfo.playlist.soundToBottomAfterPlay){
			$('#' + soundInfo.id).appendTo('#playlist-songs');
			$('#' + soundInfo.id).css('background-color', 'var(--bgL)');
			firstPlaylistSound = playlist.getFirstPlaylistItem();
			$('#' + firstPlaylistSound).css('background-color', 'var(--aM)');
		}
		$('#' + firstPlaylistSound).click();
	}
}

/**
 *	@desc:	Sets the play properties (PPC) for a song aboult to play
 *	@param:	soundInfo: Object containing all sound information
 */
function setPPC(soundInfo) {
	var loopIt = 0;
	var durationTime = (soundInfo.endTime - soundInfo.startTime) * 1000;
	if (soundInfo.loop) {
		loopIt = -1;
	}
	return new createjs.PlayPropsConfig().set({
		loop: loopIt,
		startTime: (soundInfo.startTime) * 1000,
		duration: durationTime,
		volume: 1
	});
}

/**
 *	@desc:	Finds the duration of the sound instance in the sound info object
 *	@param:	soundInfo: The soundInfo object
 */
function getDuration(soundInfo) {
	// Assumes a sound instance exists - should be true (fingers crossed)
	return (soundInfo.howl.duration() / 1000).toFixed(2);
}

/**
 *	@desc:	Fired when a sound has been preloaded by soundJS.
 *					Figures out which section the sound belongs to, creates an instance,
 						and the duration is found if it has not been already
 *	@param:	sound: The registered soundJS object (!!not keyInfo!!)
 */
function fileLoaded(sound) {
	// A sound has been preloaded.
	//console.log("Preloaded:", sound.id);
	var infoArray;
	if (playlistInfo.hasOwnProperty(sound.id)) {
		infoArray = playlistInfo;
	} else{
		for (var page in pagesInfo){
			if(pagesInfo[page].keyInfo.hasOwnProperty(sound.id)) {
	 			infoArray = pagesInfo[page].keyInfo;
			}
		}
	}
	//infoArray[sound.id].soundInstance = createjs.Sound.createInstance(sound.id);
	//infoArray[sound.id].soundInstance.playState = null; // Reset to nothing (solved some problems)
	if (infoArray[sound.id].endTime === 0 || infoArray[sound.id].endTime === null) {
		infoArray[sound.id].endTime = getDuration(infoArray[sound.id]);
	}
	loadedCount++;
	var loadedPercent = (loadedCount/totalNumSounds)*100 + "%";
	$('#loadedCount').width(loadedPercent);
	if(loadedCount === totalNumSounds || totalNumSounds === 0){
		$('#loadedContainer').css('display', 'none');
	}
}

function defaultSoundInfo(){
	return {
		"id": "",
		"infoObj": "",
		"name": "",
		"path": "",
		"color": "default",
		"loop": false,
		"startTime": 0,
		"endTime": null,
		'volume': 1,
		"playlistPosition": undefined,
		"fadeIn": function(){
				if(this.atEnding()){
					sounds.stop(this);
				}
				var duration = getFadeTime(this, 'in');
				this.fadeInterval = setInterval(() => {
					var newVol = this.howl.volume() + this.volume * 50/duration;
					if(newVol >= this.volume){
						newVol = this.volume;
						this.howl.volume(newVol);
						clearInterval(this.fadeInterval);
						return;
					}
					this.howl.volume(newVol);
				}, 50);
		},
		"fadeOut": function(){
				var duration = getFadeTime(this, 'out');
				clearInterval(this.fadeInterval);
				if(duration === 0){
					sounds.stop(this);
					return;
				}
				if(this.atEnding()){
					duration = (this.endTime - this.howl.seek()) * 1000;
				}
				this.fadeInterval = setInterval(() => {
					var newVol = this.howl.volume() - this.volume * 50/duration;
					if(newVol <= 0){
						newVol = 0;
						this.howl.volume(newVol);
						clearInterval(this.fadeInterval);
						sounds.stop(this);
						return;
					}
					this.howl.volume(newVol);
				}, 50);
		},
		"fadeInterval": undefined,
		"fadeInTime": undefined,
		"fadeOutTime": undefined,
		"atEnding": function(){
			var fadeT = getFadeTime(this, 'out');
			return (this.howl.seek() + fadeT/1000) > this.endTime;
			console.log(true);
		}
	};
}

function getFadeTime(soundInfo, direction){
	if(soundInfo.infoObj === 'playlist'){
		if(direction === 'in'){
			return soundInfo.fadeInTime || settingsInfo.general.fadeInTime;
		} else if(direction === 'out'){
			return soundInfo.fadeOutTime || settingsInfo.general.fadeOutTime;
		}
	} else {
		var currentPageInfo = pagesInfo['page' + currentPage];
		if(direction === 'in'){
			return soundInfo.fadeInTime || currentPageInfo.fadeInTime || settingsInfo.general.fadeInTime;
		} else if(direction === 'out'){
			return soundInfo.fadeOutTime || currentPageInfo.fadeOutTime || settingsInfo.general.fadeOutTime;
		}
	}

}

module.exports = {
	register: registerSound,
	fileLoaded: fileLoaded,
	playSound: playSound,
	getDuration: getDuration,
	stop: stop,
	defaultSoundInfo: defaultSoundInfo,
	getFadeTime: getFadeTime
};
