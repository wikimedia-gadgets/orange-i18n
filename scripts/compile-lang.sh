#!/usr/bin/env bash

echo "Copying files in src/ to src-working/ ..."
rm -rf src-working
cp -r src src-working

node scripts/compile-lang.js $1 $2 $3 $4 $5 $6 $7

echo 'Invoking webpack ...'
webpack --config webpack.config.js --entry ./src-working/index.js

echo "Removing src-working/"
rm -r src-working
