#!/usr/bin/env node
const process = require('process')
const { cli } = require('./cli')

cli(process.argv.slice(2), (info) => console.log(info)).then(
  (code) => (process.exitCode = code)
)
