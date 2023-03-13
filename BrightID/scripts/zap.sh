#!/bin/bash

###################################################
# This script will remove files from your         #
# filesystem without further confirmation.        #
# Only execute if you know what you are doing :-) #
###################################################

# This script makes sure there is a clean Android build environment and no
# dangling gradle caches or daemons.
# Useful when frequently switching branches with different versions of gradle,
# Android NDK / SDK or in case of general unexplainable build errors like
# duplicate resource files, missing libraries etc.

# setup nvm
export NVM_DIR="$HOME"/.nvm
source "$NVM_DIR"/nvm.sh
nvm use 16 || exit

# kill all gradle daemons
echo "killing gradle daemons..."
cd android || exit
./gradlew --stop
pkill -f '.*GradleDaemon.*'
rm -rf "$HOME"/.gradle/daemon/*
cd ..
echo "done"

# clear gradle caches
echo "clearing gradle caches"
rm -rf "$HOME"/.gradle/caches

# clear all intermediate/untracked files in android folder
echo "running \"git clean -f -d\" in android folder"
cd android || exit
git clean -f -d
cd ..
echo "done"

# clear node modules
echo "clearing node_modules folder..."
rm -rf node_modules
echo "done"

# install node modules
yarn

# run gradle clean
cd android || exit
./gradlew clean
cd ..

echo "ZAP COMPLETE"


