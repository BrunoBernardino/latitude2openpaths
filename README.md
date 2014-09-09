# Latitude2OpenPaths

This script parses and imports data from Google Latitude's history ([exported with Google Takeout](http://google.com/takeout)) and pushes it to [OpenPaths](https://openpaths.cc/), using their [API](https://openpaths.cc/api).

If you're uploading more than 2000 points, it makes several sequential requests.

### Beware

I built this script for myself, I don't have any guarantees this won't break anything.

I did successfully import almost 32k geo points from Google Latitude into OpenPaths.

**This script does not modify any data you might have. It only adds data.**

## Pre-requisites

Start by installing the dependencies, running `$ npm install`.

## Usage

`$ node import.js [OpenPaths Key] [OpenPaths Secret] [Latitude File]`

**All parameters are required**

- `[OpenPaths Key]` is your OpenPaths Key.
- `[OpenPaths Secret]` is your OpenPaths Secret.
- `[Latitude File]` is the relative location of the `GoogleLocationHistory.json` file, exported from Google.