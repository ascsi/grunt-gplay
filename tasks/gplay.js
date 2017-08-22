/*
 * grunt-gplay
 * https://github.com/allan/grunt-gplay
 *
 * Copyright (c) 2017 Allan Schytt
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerMultiTask('gplay', 'Grunt task to deploy a Cordova based app to Google Play', function() {

    var options = this.options({
      punctuation: '.',
      separator: ', '
    });

	var done = this.async();
	
	var key = require('./secret.json');
	var version = require('./package.json').version;

	var editId = ''+(new Date().getTime());

	var scopes = [
	  'https://www.googleapis.com/auth/androidpublisher'
	];

	// here, we'll initialize our client
	var OAuth2 = google.auth.OAuth2;
	var oauth2Client = new OAuth2();
	var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, scopes, null);
	var play = google.androidpublisher({
	  version: 'v2',
	  auth: oauth2Client,
	  params: {
	    packageName: 'dk.socialite.sclclubapp'
	  }
	});

	google.options({ auth: oauth2Client });

	var apkfile = './platforms/android/build/outputs/apk/android-release.apk';

	startEdit() // "open" our edit
	.then(function(data) {
	  var apk = require('fs').readFileSync(apkfile);   // stage the upload
														// (doesn't actually
														// upload anything)
	  return upload({
	    edit: data.edit,
	    apk: apk
	  });
	}).then(function(data) {
	  return setTrack(data);   // set our track
	}).then(function(data) {
	  return commitToPlayStore(data);   // commit our changes
	}).then(function(data) {
	  console.log('Successful upload:', data);   // log our success!
	})
	.catch(function(err) {
	  console.log(err);
	  process.exit(0);
	});

	/**
	 * Sets our authorization token and begins an edit transaction.
	 */
	function startEdit() {
	  return new Promise(function(resolve, reject) {
	    jwtClient.authorize(function(err, tokens) { // get the tokens
	      if(err) {
	        console.log(err);
	        return;
	      }
	      oauth2Client.setCredentials(tokens); // set the credentials from
												// the tokens
	      play.edits.insert({
	        resource: {
	          id: editId,
	          expiryTimeSeconds: 600 // this edit will be valid for 10
										// minutes
	        }
	      }, function(err, edit) {
	        if(err || !edit) {
	          reject(err);
	        }
	        resolve({
	          edit: edit
	        });
	      });
	    });
	  });
	}

	/**
	 * Stages an upload of the APK (but doesn't actually upload anything)
	 */
	function upload(data) {
	  var edit = data.edit;
	  var apk = data.apk;

	  return new Promise(function(resolve, reject) {
	    play.edits.apks.upload({
	      editId: edit.id,
	      media: {
	        mimeType: 'application/vnd.android.package-archive',
	        body: apk
	      }
	    }, function(err, res) {
	      if(err || !res) {
	        reject(err);
	      }
	      resolve(_.omit(_.extend(data, { uploadResults: res }), 'apk'));
	    }); // pass any data we care about to the next function call
	  });
	}

	/**
	 * Sets our track (beta, production, etc.)
	 */
	function setTrack(data) {
	  var edit = data.edit;
	  var track = 'beta';

	  return new Promise(function(resolve, reject) {
	    play.edits.tracks.update({
	      editId: edit.id,
	      track: track,
	      resource: {
	        track: track,
	        versionCodes: [+data.uploadResults.versionCode]
	      }
	    }, function(err, res) {
	      if(err || !res) {
	        reject(err);
	      }

	      resolve(_.extend(data, { setTrackResults: res }));
	    });
	  });

	}

	/**
	 * Commits our edit transaction and makes our changes live.
	 */
	function commitToPlayStore(data) {
	  return new Promise(function(resolve, reject) {
	    play.edits.commit({
	      editId: data.edit.id
	    }, function(err, res) {
	      if(err || !res) {
	        reject(err);
	      }

	      resolve(_.extend(data, { commitToPlayStoreResults: res }));
	      
	      grunt.log.ok('new version committed');
	      
	      done();
	    });
	  });
	}
	
});

};
