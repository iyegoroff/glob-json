const tap = require('tap')
const path = require('path')
const {
  promises: { readFile },
} = require('fs')
const { fileset, del, setValue, setKey, merge } = require('.')

const json = (files) =>
  Promise.all(
    files.map(({ dst }) => readFile(dst).then(String).then(JSON.parse))
  )

const test0 = {
  version: 0,
  name: 'test0',
  test: {
    temp0: 0,
    test0: '0',
  },
}

const test1 = {
  version: 1,
  test: {
    temp1: 1,
    test1: '1',
  },
  name: 'test1',
}

const createFixtures = (t) => {
  const fixtures = t.testdir({
    'test0.json': JSON.stringify(test0),
    'test1.json': JSON.stringify(test1),
  })

  return { fxt: (f) => path.join(fixtures, f) }
}

tap.test('fileset', async (t) => {
  const { fxt } = createFixtures(t)

  await t.test(
    'each dst and src pair should point to same file, when no src specified',
    async (t) => {
      const files = await fileset(fxt('*.json'))
      files.forEach(({ dst, src }) => t.equal(dst, src))
    }
  )

  await t.test(
    'src should point to same single file, when src specified',
    async (t) => {
      const srcFxt = fxt('test1.json')
      const files = await fileset(fxt('*.json'), srcFxt)
      files.forEach(({ src }) => t.equal(srcFxt, src))
    }
  )
})

tap.test('del', async (t) => {
  const { fxt } = createFixtures(t)

  await t.test('should delete properties from dst files', async (t) => {
    await fileset(fxt('*.json')).then(del('test/*'))

    t.strictSame(await fileset(fxt('*.json')).then(json), [
      { ...test0, test: {} },
      { ...test1, test: {} },
    ])
  })
})

tap.test('setValue', async (t) => {
  const { fxt } = createFixtures(t)

  await t.test('should set property in dst files', async (t) => {
    await fileset(fxt('*.json')).then(setValue('version', 'test'))

    t.strictSame(await fileset(fxt('*.json')).then(json), [
      { ...test0, version: 'test' },
      { ...test1, version: 'test' },
    ])
  })
})

tap.test('setKey', async (t) => {
  const { fxt } = createFixtures(t)

  await t.test('should set property from src file in dst files', async (t) => {
    await fileset(fxt('test0.json'), fxt('test1.json')).then(
      setKey('version', 'test/test1')
    )

    t.strictSame(await fileset(fxt('*.json')).then(json), [
      { ...test0, version: '1' },
      test1,
    ])
  })
})

tap.test('merge', async (t) => {
  const { fxt } = createFixtures(t)

  await t.test(
    'should merge property from src file into dst files properties',
    async (t) => {
      await fileset(fxt('test0.json'), fxt('test1.json')).then(
        merge('test', 'test')
      )

      t.strictSame(await fileset(fxt('*.json')).then(json), [
        { ...test0, test: { ...test0.test, ...test1.test } },
        test1,
      ])
    }
  )
})
