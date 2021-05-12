#!/usr/bin/env bash

echo "Copying files in src to src-working ..."
rm -rf src-working
cp -r src src-working

node scripts/compile-lang.js $1 $2 $3 $4 $5 $6 $7
if [ $? -ne 0 ]; then
  echo "Custom build script failed :("
  exit 1
fi

echo 'Invoking rollup ...'
rollup -c rollup.config.js -i src-working/index.js

echo "Removing src-working"
rm -r src-working
