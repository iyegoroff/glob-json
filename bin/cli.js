const { setValue, del, fileset, merge, setKey } = require('../src')

const usage = `

Utility to modify JSON files with globbing patterns. It uses 'glob' and 'minimatch' in 'dot:true' mode.
Since the '/' character is used as a path separator for keys, this tool has some limitations. For example,
'x/*/z' key pattern will match '{ x: { y: { z: 1 } } }', but not '{ x: { "y/w": { z: 1 }}}'.

Usage:

  glob-json <dstPathGlob> [srcPath] <set|del|merge> <dstKeyGlob> [--key|--number|--string|--true|--false|--null|srcKey] [value]

Options:

  dstPathGlob - a glob pattern to select destination files
  srcPath     - path to a source file, if not specified each destination file will be its own source

Commands:

  set <dstKeyGlob> [--string|--number|--true|--false|--null|--key] [value]

    Changes properties in destination files

    Options:

      dstKeyGlob   - a glob pattern to select paths in destination files
      -s, --string - treat next argument as a string value, this is the default option
      -n, --number - treat next argument as a number value
      -t, --true   - set selected properties to 'true'
      -f, --false  - set selected properties to 'false'
      --null       - set selected properties to 'null'
      -k, --key    - treat next argument as a path to value in a source file
      value        - source value or a path to value in a source file

    Examples:

      glob-json 'fixtures/**/*.json' set version --number 5
      glob-json package.json my-lib.json set 'dependencies/my-lib' --key version

  del <dstKeyGlob>

    Deletes properties from destination files

    Options:

      dstKeyGlob - a glob pattern to select paths in destination files

    Examples:

      glob-json temp.json del 'some/**/deeply/*/nested/key'

  merge <dstKeyGlob> <srcKey>

    Merges property from source file into destination files

    Options:

      dstKeyGlob   - a glob pattern to select paths in destination files
      srcKey       - path to value in a source file

    Examples:

      glob-json 'packages/*/package.json' merge '' publishConfig
`

const ok = () => 0

const fail = (message = usage) => {
  throw new Error(message)
}

const cli = (argv, log = () => {}) => {
  if (
    argv[0] === '-h' ||
    argv[0] === '--help' ||
    argv[0] === 'help' ||
    argv.length < 3
  ) {
    log(usage)
    return Promise.resolve(ok())
  }

  const dstPathGlob = argv[0]
  const srcPath =
    argv[1] === 'set' || argv[1] === 'del' || argv[1] === 'merge'
      ? undefined
      : argv[1]
  const [command, args] =
    srcPath === undefined ? [argv[1], argv.slice(2)] : [argv[2], argv.slice(3)]

  return fileset(dstPathGlob, srcPath)
    .then((files) => {
      if (command === 'set') {
        if (args.length < 2 || args.length > 3) {
          return fail()
        }

        const dstKeyGlob = args[0]

        if (args[1] === '-k' || args[1] === '--key') {
          return args.length === 3 ? setKey(dstKeyGlob, args[2])(files) : fail()
        }

        if (args[1] === '-n' || args[1] === '--number') {
          return args.length === 3
            ? setValue(dstKeyGlob, Number(args[2]))(files)
            : fail()
        }

        if (args[1] === '-s' || args[1] === '--string') {
          return args.length === 3
            ? setValue(dstKeyGlob, args[2])(files)
            : fail()
        }

        if (args[1] === '-t' || args[1] === '--true') {
          return args.length === 2 ? setValue(dstKeyGlob, true)(files) : fail()
        }

        if (args[1] === '-f' || args[1] === '--false') {
          return args.length === 2 ? setValue(dstKeyGlob, false)(files) : fail()
        }

        if (args[1] === '--null') {
          return args.length === 2 ? setValue(dstKeyGlob, null)(files) : fail()
        }

        return args.length === 2 ? setValue(dstKeyGlob, args[1])(files) : fail()
      } else if (command === 'del') {
        return args.length === 1 ? del(args[0])(files) : fail()
      }

      if (command === 'merge') {
        return args.length === 2 ? merge(args[0], args[1])(files) : fail()
      }

      return fail()
    })
    .then(ok)
    .catch((e) => {
      log(e.message)
      return 1
    })
}

module.exports = { cli }
