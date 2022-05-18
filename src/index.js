const { promisify } = require('util')
const {
  promises: { readFile, writeFile },
} = require('fs')
const path = require('path')
const glob = promisify(require('glob'))
const minimatch = require('minimatch')
const traverse = require('traverse')

const fileset = (dst, src) =>
  glob(dst).then((fs) => fs.map((f) => ({ dst: f, src: src ?? f })))

const del = (dstKey) => (files) =>
  Promise.all(
    files.map(({ dst: path }) =>
      readFile(path)
        .then(String)
        .then(JSON.parse)
        .then((json) =>
          traverse(json).forEach(function (v) {
            if (minimatch(this.path.join('/'), dstKey, { dot: true })) {
              this.remove()
            }
          })
        )
        .then(JSON.stringify)
        .then((str) => writeFile(path, str))
    )
  )

const merge = (dstKey, srcKey) => (files) => {}

const setValue = (dstKey, value) => (files) => {}

const setKey = (dstKey, srcKey) => (files) => {}

module.exports = { fileset, del, merge, setValue, setKey }

// fileset('fixtures/*.json')
//   .then(del('name'))
//   .then((x) => console.log(x))

console.log(
  traverse({ name: 'test', 'config.foo': 1, config: { foo: 2 } }).forEach(
    function (v) {
      if (this.path.join('/') === 'config/foo') {
        this.remove()
      }
    }
  )
)
