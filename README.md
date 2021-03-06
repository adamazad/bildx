# BildX

[![Tests status](https://github.com/adamazad/bildx/workflows/Tests/badge.svg)](https://github.com/adamazad/bildx/actions)

The self-hosted version of [imgix](https://imgix.com/) for micro projects. PRs are welcome.

## Getting started

Install from via [npm](https://npmjs.com/package/bildx)

```
$ npm i bildx
```

Create a instance, and call `start`. Put images in `storage`

```javascript
import BildX from "bildx"
import { resolve } from "path"

const BILDX_PORT = process.env.BILDX_PORT || 4000

const bildx = new BildX({
  storage: new BildXStorage(resolve("./storage")),
  cache: new BildXStorage(resolve("./cache")),
})

bildx.start(BILDX_PORT).then(() => console.log(`BildX deployed on ${BILDX_PORT}`))
```

Note: `BildX.Storage` throws an error if path is not absolute.

## APIs

Currently, BildX supports:

- `width`
- `height`
- `fill`
- `blur`

## Tests

```
$ npm test
```

## WIP

- Implement all [the APIs](https://docs.imgix.com/apis/url) imgix provides
- Support for S3 and/or Firebase Storage
