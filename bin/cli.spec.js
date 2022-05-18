const tap = require('tap')
const path = require('path')
const {
  promises: { readFile },
} = require('fs')
const { cli } = require('./cli')

const test = {
  version: 0,
  name: 'test',
  config: {
    foo: [1, 2, 3],
  },
}

const testName = 'glob-json-test.json'

const createFixtures = (t) => t.testdir({ [testName]: JSON.stringify(test) })

const json = (filePath) => readFile(filePath).then(String).then(JSON.parse)

tap.test('del', async (t) => {
  const filePath = path.join(createFixtures(t), testName)

  await t.test('should delete properties from dst files', async (t) => {
    await cli([filePath, 'del', 'version'])

    const { version, ...expected } = test
    t.strictSame(await json(filePath), expected)
  })
})

tap.test('merge', async (t) => {
  const filePath = path.join(createFixtures(t), testName)

  await t.test(
    'should merge property from src file into dst files properties',
    async (t) => {
      await cli([filePath, 'merge', '', 'config'])

      t.strictSame(await json(filePath), { ...test, ...test.config })
    }
  )
})

tap.test('set', async (t) => {
  const filePath = path.join(createFixtures(t), testName)

  await t.test('should set property in dst files', async (t) => {
    await cli([filePath, 'set', 'name', '-n', '100'])

    t.strictSame(await json(filePath), { ...test, name: 100 })
  })

  await t.test('should set property from src file in dst files', async (t) => {
    await cli([filePath, 'set', 'name', '-k', 'version'])

    t.strictSame(await json(filePath), { ...test, name: 0 })
  })
})

tap.test('no arguments is ok', async (t) => {
  t.equal(await cli([]), 0)
})

tap.test('no command is fail', async (t) => {
  t.equal(await cli(['foo', 'bar', 'baz']), 1)
})

tap.test('help|-h|--help arg is ok', async (t) => {
  t.equal(await cli(['help']), 0)
  t.equal(await cli(['-h']), 0)
  t.equal(await cli(['--help']), 0)
})

tap.test('del with 1 arg is ok', async (t) => {
  t.equal(await cli(['foo', 'del', 'bar']), 0)
  t.equal(await cli(['foo', 'bar', 'del', 'bar']), 0)
})

tap.test('del with 2 args is fail', async (t) => {
  t.equal(await cli(['foo', 'del', 'bar', 'baz']), 1)
  t.equal(await cli(['foo', 'bar', 'del', 'bar', 'baz']), 1)
})

tap.test('merge with 1 arg is fail', async (t) => {
  t.equal(await cli(['foo', 'merge', 'bar']), 1)
  t.equal(await cli(['foo', 'bar', 'merge', 'bar']), 1)
})

tap.test('merge with 2 args is ok', async (t) => {
  t.equal(await cli(['foo', 'merge', 'bar', 'baz']), 0)
  t.equal(await cli(['foo', 'bar', 'merge', 'bar', 'baz']), 0)
})

tap.test('set with 1 arg is fail', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar']), 1)
})

tap.test('set with -k|--key and 3 arg is ok', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '-k', 'foo']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '-k', 'foo']), 0)
  t.equal(await cli(['foo', 'set', 'bar', '--key', 'foo']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--key', 'foo']), 0)
})

tap.test('set with -k|--key and 2 arg is fail', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '-k']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '-k']), 1)
  t.equal(await cli(['foo', 'set', 'bar', '--key']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--key']), 1)
})

tap.test('set with -n|--number and 3 arg is ok', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '-n', 'foo']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '-n', 'foo']), 0)
  t.equal(await cli(['foo', 'set', 'bar', '--number', 'foo']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--number', 'foo']), 0)
})

tap.test('set with -n|--number and 2 arg is fail', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '-n']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '-n']), 1)
  t.equal(await cli(['foo', 'set', 'bar', '--number']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--number']), 1)
})

tap.test('set with -s|--string and 3 arg is ok', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '-s', 'foo']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '-s', 'foo']), 0)
  t.equal(await cli(['foo', 'set', 'bar', '--string', 'foo']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--string', 'foo']), 0)
})

tap.test('set with -s|--string and 2 arg is fail', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '-s']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '-s']), 1)
  t.equal(await cli(['foo', 'set', 'bar', '--string']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--string']), 1)
})

tap.test('set with -t|--true and 2 arg is ok', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '-t']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '-t']), 0)
  t.equal(await cli(['foo', 'set', 'bar', '--true']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--true']), 0)
})

tap.test('set with -t|--true and 3 arg is fail', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '-t', 't']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '-t', 't']), 1)
  t.equal(await cli(['foo', 'set', 'bar', '--true', 't']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--true', 't']), 1)
})

tap.test('set with -f|--false and 2 arg is ok', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '-f']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '-f']), 0)
  t.equal(await cli(['foo', 'set', 'bar', '--false']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--false']), 0)
})

tap.test('set with -f|--false and 3 arg is fail', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '-f', 't']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '-f', 't']), 1)
  t.equal(await cli(['foo', 'set', 'bar', '--false', 't']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--false', 't']), 1)
})

tap.test('set with --null and 2 arg is ok', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '--null']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--null']), 0)
})

tap.test('set with --null and 3 arg is fail', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', '--null', 't']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', '--null', 't']), 1)
})

tap.test('set with 2 arg is ok', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', 'x']), 0)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', 'x']), 0)
})

tap.test('set with 3 arg is fail', async (t) => {
  t.equal(await cli(['foo', 'set', 'bar', 'x', 'y']), 1)
  t.equal(await cli(['foo', 'bar', 'set', 'bar', 'x', 'y']), 1)
})
