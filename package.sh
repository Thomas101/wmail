#!/bin/bash

electron-packager . "WMail" --platform=darwin --arch=all --version=0.36.2 --app-bundle-id="tombeverley.wmail" --app-version="1.0.0" --icon="icons/app.icns" --overwrite --ignore="/release/|/icons/|package.sh|screenshot.png|README.md";
mkdir ./WMail-darwin-x64/licenses;
mv ./WMail-darwin-x64/LICENSES.chromium.html ./WMail-darwin-x64/licenses/LICENSES.chromium.html;
mv ./WMail-darwin-x64/LICENSE ./WMail-darwin-x64/licenses/LICENSE.electron;
cp ./node_modules/electron-google-oauth/license ./WMail-darwin-x64/licenses/LICENSE.electron-google-oauth;
cp ./node_modules/electron-prebuilt/LICENSE ./WMail-darwin-x64/licenses/LICENSE.electron-prebuilt;
cp ./node_modules/googleapis/COPYING ./WMail-darwin-x64/licenses/LICENSE.googleapis;
cp ./node_modules/node-fetch/LICENSE.md ./WMail-darwin-x64/licenses/LICENSE.node-fetch;

