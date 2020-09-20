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
  storage: new BildX.Storage(resolve(__dirname, "./storage")),
  cache: new BildX.Storage(resolve(__dirname, "./cache")),
})

bildx.start(BILDX_PORT).then(() => console.log(`BildX deployed on ${BILDX_PORT}`)
```

## Tests

```
$ npm test
```

## WIP

- Implement all [the APIs](https://docs.imgix.com/apis/url) imgix provides
- Support for S3 and/or Firebase Storage
- Redis cache layer with TTL
