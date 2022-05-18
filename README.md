# glob-json

[![npm](https://img.shields.io/npm/v/glob-json)](https://npm.im/glob-json)
[![build](https://github.com/iyegoroff/glob-json/workflows/build/badge.svg)](https://github.com/iyegoroff/glob-json/actions/workflows/build.yml)
[![publish](https://github.com/iyegoroff/glob-json/workflows/publish/badge.svg)](https://github.com/iyegoroff/glob-json/actions/workflows/publish.yml)
[![codecov](https://codecov.io/gh/iyegoroff/glob-json/branch/main/graph/badge.svg?t=1520230083925)](https://codecov.io/gh/iyegoroff/glob-json)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/glob-json)
[![npm](https://img.shields.io/npm/l/glob-json.svg?t=1495378566925)](https://www.npmjs.com/package/glob-json)

## Installation

```
npm i glob-json
```

## Description

Utility to modify JSON files with globbing patterns. It uses 'glob' and 'minimatch' in 'dot:true' mode.Since the '/' character is used as a path separator for keys, this tool has some limitations. For example, 'x/\*/z' key pattern will match '{&nbsp;x:&nbsp;{&nbsp;y:&nbsp;{&nbsp;z:&nbsp;1&nbsp;}&nbsp;}&nbsp;}', but not '{&nbsp;x:&nbsp;{&nbsp;"y/w":&nbsp;{&nbsp;z:&nbsp;1&nbsp;}}}'.

Usage:

`glob-json <dstPathGlob> [srcPath] <set|del|merge> <dstKeyGlob> [--key|--number|--string|--true|--false|--null|srcKey] [value]`

Options:

dstPathGlob - a glob pattern to select destination files
srcPath - path to a source file, if not specified each destination file will be its own source

Commands:

`set <dstKeyGlob> [--string|--number|--true|--false|--null|--key] [value]`

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

`del <dstKeyGlob>`

    Deletes properties from destination files

    Options:

      dstKeyGlob - a glob pattern to select paths in destination files

    Examples:

      glob-json temp.json del 'some/**/deeply/*/nested/key'

`merge <dstKeyGlob> <srcKey>`

    Merges property from source file into destination files

    Options:

      dstKeyGlob   - a glob pattern to select paths in destination files
      srcKey       - path to value in a source file

    Examples:

      glob-json 'packages/*/package.json' merge '' publishConfig
