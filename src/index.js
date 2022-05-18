const { promisify } = require('util')
const {
  promises: { readFile, writeFile },
} = require('fs')
const path = require('path')
const glob = promisify(require('glob'))
const minimatch = require('minimatch')
const traverse = require('traverse')
const jsonFormat = require('json-format')

const match = (path, dstGlob) =>
  minimatch(path.join('/'), dstGlob, { dot: true })

const fileset = (dst, src) =>
  glob(dst).then((fs) => fs.map((f) => ({ dst: f, src: src ?? f })))

const setValue = (dstGlob, value) => (files) =>
  Promise.all(
    files.map(({ dst }) =>
      readFile(dst)
        .then((dstBuf) =>
          traverse(JSON.parse(String(dstBuf))).forEach(function (oldValue) {
            if (match(this.path, dstGlob)) {
              this.update(value)
            }
          })
        )
        .then((json) => writeFile(dst, jsonFormat(json)))
    )
  )

const del = (dstGlob) => setValue(dstGlob, undefined)

const assign = (map) => (dstGlob, srcKey) => (files) =>
  Promise.all(
    files.map(({ dst, src }) =>
      Promise.all([readFile(dst), readFile(src)])
        .then(([dstBuf, srcBuf]) => {
          const newValue = traverse(JSON.parse(String(srcBuf))).reduce(
            function (acc, val) {
              return this.path.join('/') === srcKey ? val : acc
            },
            undefined
          )

          return traverse(JSON.parse(String(dstBuf))).map(function (oldValue) {
            return match(this.path, dstGlob)
              ? map(oldValue, newValue)
              : oldValue
          })
        })
        .then((json) => writeFile(dst, jsonFormat(json)))
    )
  )

const setKey = assign((_, value) => value)

const merge = assign((oldValue, newValue) => ({ ...oldValue, ...newValue }))

module.exports = { fileset, del, merge, setValue, setKey }
