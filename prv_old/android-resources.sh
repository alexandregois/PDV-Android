#!/usr/bin/env bash

ANDROID_RESOURCES_PATH=$(find ./android/app/src/main/res -maxdepth 1 -type d)
SOURCE_ICONS_PATH="./resources/android/icon"
SOURCE_SPLASH_PATH=$(find ./resources/android/splash -maxdepth 1 -type d)

for d in $ANDROID_RESOURCES_PATH
do
  SOURCE_PATH=$(basename $d)
  SPLASH="${d}/splash.png"
  if [ -f "$SPLASH" ]
  then
    SOURCE="${SOURCE_SPLASH_PATH}/${SOURCE_PATH}-screen.png"
    cp $SOURCE $SPLASH
#  elif [[ "$SOURCE_PATH" == "mipmap-"* ]]
#  then
#    SOURCE="${SOURCE_ICONS_PATH}/${SOURCE_PATH}"
#    cp -r $SOURCE ./android/app/src/main/res
  fi
done
