# LA-MPS

This angular project is used to create 3 separate but integrated web-based applications.

Legal Marker - this app provides a reader / editor environment for LSJson format document 
Legal Pad - note taking using LSJson
Legal Search - UI to search LSJson

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## Build

Please refer to the standard Angular documentation in preparing your environment to build/test/run angular applications.  You will need to install these applications to continue:

Setup node.js this will provide all the build tools  [Node.js](https://nodejs.org/en/download/)

Setup for angular applications [Angular CLI](https://angular.io/guide/setup-local)

npm commands are placed in the file package.json to simplify build tasks 

 ```js
 "scripts": {
    "ng": "ng",
    "start": "ng serve -o",
    "watch": "ng build --watch --configuration development",
    "build": "ng build",
    "build-prod": "ng build --configuration production --output-path ./dist/angUI",
    "serve-prod": "lite-server --baseDir=dist/angui ",
    "test-headless": "ng test --watch=false --browsers=ChromeHeadless",
    "test-forever": "ng test --watch=true --browsers=ChromeHeadless",
    "test": "ng test --code-coverage",
    "test-prod": "http-server .\\dist\\angUI\\index.html",
    "coverage": "ng test --code-coverage",
    "report": "start coverage/legalapprentice/index.html",
    "e2e": "ng e2e",
    "format:check": "prettier --config ./.prettierrc --list-different \"src/{app,environments,assets}/**/*{.html,.ts,.js,.json,.css,.scss}\"",
    "run:marker": "lite-server --baseDir ./dist/legalmarker",
    "run:bva": "lite-server --baseDir ./dist/legalmarkerbva",
    "run:pad": "lite-server --baseDir ./dist/legalpad",
    "run:search": "lite-server --baseDir ./dist/legalsearch",
    "build:bva": "ng build legalmarkerbva --configuration production",
    "build:pad": "ng build legalpad --configuration production",
    "build:search": "ng build legalsearch --configuration production",
    "build:all": "build:pad && build:search && build:bva",
    "legalmarker": "ws --spa ./dist/legalmarker/index.html"
  },
 ```

### Build Legal Marker
to build Legal Marker follow these steps - 

at the command line type:

npm run build:all



### After the Build 
The build artifacts will be stored in the `dist/` directory.  The files in this directory must be `served up` or loaded into the web browser.  these commands will launch the applications.


