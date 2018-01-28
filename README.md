# Bicycle Touring Companion - Client App 
[![Build Status](https://travis-ci.org/WheelieTired/btc-app.svg?branch=develop)](https://travis-ci.org/WheelieTired/btc-app)

Bicycle Touring Companion uses [React](https://facebook.github.io/react/) and [Cordova](https://cordova.apache.org) to build a native android application.

Have [npm](https://www.npmjs.com) installed on your development machine (available when installing [node](https://nodejs.org/)).

**Run `npm install`**
## Android
### Running on Android
*Minimum SDK 19 (Android 4.4)*

1. Install [Android Studio](https://developer.android.com/studio/index.html)   

#### Simulator
2. `npm run start:android-sim` (this build will respect your NODE_ENV for selecting the servers, localhost by default)
3. You can inspect the Android view by going to `chrome://inspect`
4. Repeat from step 2 to build again  

#### Device
2. Make sure your device shows up on `adb devices`
3. `npm run start:android-device` (this build will point to AWS)
4. You can inspect the Android view by going to `chrome://inspect`
5. Repeat from step 3 to build again  

## iOS
### Running on iOS
*Minimum iOS 9.0*  

1. Install [Xcode](https://developer.apple.com/xcode/) on your Mac  

#### Simulator
2. `npm run start:ios-sim` (this build will respect your NODE_ENV for selecting the servers, localhost by default)
3. You can inspect the iOS view by using Safari remote debugging on your Mac 
4. Repeat from step 2 to build again  

#### Device
2. Open platforms/iOS/BTC.xcodeproj  
3. Set the project to use your code signing credentials  
4. `npm run start:ios-device` (this build will point to AWS)
5. You can inspect the iOS view by using Safari remote debugging on your Mac 
6. Repeat from step 4 to build again  

## Browser
### Developing in Browser
1. `npm run dev` (this build will respect your NODE_ENV for selecting the servers, localhost by default)
2. Open `http://localhost:8000/browser/www/`
3. The Chrome extension _LiveReload_ your browser session will reload when you update a file.  (not required, but nice)

### Deploying for Web
1. Set your `NODE_ENV` environment variable to `production` if you want the build to point to AWS
2. `npm run dev` (you can stop the local server once it starts)
3. Copy contents of `platforms/browser/www` to your web server's documents directory (all served files are static)
4. The web server document directory is the btc-app-web bucket on AWS.
5. Set all the files in this directory to world readable.
6. If you want the website to update faster, run an invalidation on `/*` in CloudFront.

_Look at the `package.json` for other commands!_  

### Other Information
- Discussion of deployment of different pieces with links and tips: https://github.com/Tour-de-Force/btc-app/issues/221
- Explanation of custom map server exploration: https://github.com/Tour-de-Force/btc-app/issues/222
- The script `npm run format` ensures well formated code. Run `npm run format:replace` will make these changes
  - The current formatter suggest unix line endings
- The script `npm run lint` will reveal js
- `src/js/` contains most of the code that is being send to the client
  - Using [Redux](https://github.com/reactjs/redux), reducers are in the `/reducers` folder, and actions are in the reducer files (they are one line actions, so the need for seperate files was low)
  - containers are pages that get rendered in the app. They are in the `/containers` folder and are composed of components in the `/components` folder
    - components are used in multiple pages, so when modifying them make sure to check their references elsewhere in the document
  - `usbr20.json` is a track that is, for all intents and purposes, hardcoded- This should be replaced with dynamic tracks asap.
  - Modifying the `config.xml` changes the cordova/android settings
    - There is an svg for the alpha and normal logo in `/src/img` folder. Using a command line tool like [imagemagick](http://www.imagemagick.org/) or a vector graphics editing tool like [Inkscape](https://inkscape.org/) should allow you to modify or export it into multiple sizes.
- Testing
  - 'npm run test' to execute test runner
  - For javascript unit testing, we are using the [Mocha](https://mochajs.org/) stack, with [Chai](http://chaijs.com/) and [Sinon](http://sinonjs.org/). We run client-side tests using the Karma test runner, which runs the tests inside a browser instance.
  - [Skin-deep](https://github.com/glenjamin/skin-deep) is a testing framework to mock the react components used in the client, and test the state, props, and rendered component. We forked the official glenjamin/skin-deep repository in an attempt to resolve project specific issues. We would recommend to future teams to attempt to use the newest version of skin-deep, or more mature testing frameworks, such as Airbnb’s React testing framework, [Enzyme](https://github.com/airbnb/enzyme).
