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

A string value that holds the path and the name of your APK file. For instance 'apk':'./platforms/android/build/android-release.apk'

#### options.secret
Type: `String`
Default value: `'.'`

A string value that hold the path to the Google service account JSON file. For instance 'secret': './secret.JSON'.

#### options.secret
Type: `String`
Default value: `'.'`

A string value that hold the path to the Google service account JSON file. For instance 'secret': './secret.JSON'.



### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  gplay: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  gplay: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
