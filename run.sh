#!/bin/bash

cd ui && make && cd .. && PATH="./node_modules/.bin:$PATH" ./lib/run.js