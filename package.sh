#!/bin/bash

electron-packager . "WMail" --platform=darwin --arch=all --version=0.36.2 --app-bundle-id="tombeverley.wmail" --app-version="1.1.3" --icon="icons/app.icns" --overwrite --ignore="/release/|/icons/|package.sh|screenshot.png|README.md";
mkdir ./WMail-darwin-x64/vendor-licenses;
mv ./WMail-darwin-x64/LICENSES.chromium.html ./WMail-darwin-x64/vendor-licenses/LICENSES.chromium.html;
mv ./WMail-darwin-x64/LICENSE ./WMail-darwin-x64/vendor-licenses/LICENSE.electron;
cp ./node_modules/electron-google-oauth/license ./WMail-darwin-x64/vendor-licenses/LICENSE.electron-google-oauth;
cp ./node_modules/electron-prebuilt/LICENSE ./WMail-darwin-x64/vendor-licenses/LICENSE.electron-prebuilt;
cp ./node_modules/googleapis/COPYING ./WMail-darwin-x64/vendor-licenses/LICENSE.googleapis;
cp ./node_modules/node-fetch/LICENSE.md ./WMail-darwin-x64/vendor-licenses/LICENSE.node-fetch;
cp ./node_modules/appdirectory/LICENSE.md ./WMail-darwin-x64/vendor-licenses/LICENSE.appdirectory;
cp ./node_modules/electron-localshortcut/license ./WMail-darwin-x64/vendor-licenses/LICENSE.electron-localshortcut;
cp ./LICENSE ./WMail-darwin-x64/LICENSE;

