/*
 * grunt-gplay
 * https://github.com/allan/grunt-gplay
 *
 * Copyright (c) 2017 Allan Schytt
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');
var google = require('googleapis');
var Promise = require('bluebird');
var _ = require('lodash');


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
	
	function bump(){
		
		var args = this.args;
		if (args.length === 0)
			args = [ 'sub' ];

		// bumping package.json file
		grunt.log.verbose.ok('reading local package.json file');
		grunt.file.defaultEncoding = 'utf8';
		var pkg = grunt.file.readJSON('package.json');
		var parts = pkg.version.split('.');
		var oldVersion = "version=\"" + pkg.version + "\"";

		for (var i = 0; i < parts.length; ++i) {
			switch (i) {
			case 0:
				if (args.indexOf('major') !== -1) {
					parts[i] = (Number(parts[i]) + 1).toString();
					parts[1] = '0';
					parts[2] = '0';
					pkg.version = parts[0] + '.' + parts[1] + '.' + parts[2];
				}
				break;
			case 1:
				if (args.indexOf('minor') !== -1) {
					parts[i] = (Number(parts[i]) + 1).toString();
					parts[2] = '0';
					pkg.version = parts[0] + '.' + parts[1] + '.' + parts[2];
				}
				break;
			case 2:
				if (args.indexOf('sub') !== -1) {
					parts[i] = (Number(parts[i]) + 1).toString();
					pkg.version = parts[0] + '.' + parts[1] + '.' + parts[2];
				}
			}
		}

		grunt.file.write('package.json', JSON.stringify(pkg, null, 2));
		
		// bumping config.xml file
		var regex = /(.+)version *= *\"[0-9]+\.?[0-9]+?\.?[0-9]+?\"(.+)/g
		var config = grunt.file.read('config.xml');
		config = config.replace(regex, "$1version=\"" +pkg.version + "\"$2");
		grunt.file.write("config.xml", config);
		grunt.log.ok('bumped to version ' + pkg.version);
	}
	
});

};
