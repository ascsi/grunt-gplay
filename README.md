# grunt-gplay

> Grunt task to deploy a Cordova based app to Google Play

```shell
npm install grunt-gplay --save-dev
```

## Getting Started
The first APK of your App needs to be uploaded via the web interface. This is to register the application id and cannot be done using the Play Developer API. For all subsequent uploads and changes this plugin can be used.

To use the publisher plugin you have to create a service account for your existing Google Play Account. See https://developers.google.com/android-publisher/getting_started for more information.

You need to create a service account, which can be done via the GCloud developer console.
https://console.cloud.google.com/projectselector/iam-admin/serviceaccounts.
When you have made the service account you have a so called service account email address and a secret.json file. 

In Google play developer console you can add the service account to your Google Play account.


## The "gplay" task

### Overview
Install **grunt-gplay** 

```shell
npm install grunt-gplay --save-dev
```

Add task to your Gruntfile

```js
grunt.loadNpmTasks('grunt-gplay');
```

```js
grunt.initConfig({
  gplay: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.APK
Type: `String`
**Required**

A string value that holds the path and the name of your APK file.

#### options.secret
Type: `String`
**Required**

A string value that hold the path to the Google service account JSON file. For instance 'secret': './secret.JSON'.

#### options.package
Type: `String`
**Required**

A string value that holds the the package name.

#### options.track
Type: `String`
Default value: `'beta'`

A string value, setting which track is relased. Legal values are production, roolout, beta and alfa.

#### options.bump
Type: `String`, Array of Strings
Default value: `'sub'`

A boolean value telling if you want to bump your Config.xml. As a default the task will try to bump the sub-version. Legal values are major, minor and sub.



### Usage Examples

grunt.initConfig({
  gplay: {
    options: {
      apk: './platforms/android/build/outputs/apk/android-release.apk',
      secret: 'secret.json',
      track :'alfa',
      bump: ['package.json', 'config.xml']
    },
  }
});

## Contributing
Recognition to ...

## Release History
First release
