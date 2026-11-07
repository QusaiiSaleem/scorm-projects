# games/three: three.js, one copy for every 3D game

`three.module.min.js` is **three.js 0.187.0** (r187), the version
dsh-game-studio pins for its `voxel` template (its `package.json` and
`THIRD_PARTY_NOTICES.md`), as ONE minified ES module: `build/three.module.js`
and the `build/three.core.js` it imports, bundled into one file. Every export
of `three` is in it; nothing was left out, so the next 3D game finds the
whole library and not the part the first one used.

A 3D game imports it from its own folder:

```js
const THREE = await import('../three/three.module.min.js');
```

and a package carries this folder only for a lecture whose page links a game
that imports it (Scitter follows the import; no list names it). It is linked,
never copied into a lecture's `assets/`.

## How it was made (2026-11-07)

```text
npm pack three@0.187.0          # the published package, unchanged
echo "export * from '<package>/build/three.module.js';" > entry.mjs
esbuild entry.mjs --bundle --format=esm --minify --target=es2020 \
  --outfile=three.module.min.js  # esbuild 0.25.12
```

748,783 bytes; 189,489 gzipped. The `@license` banner esbuild keeps at the
end of the file is three's own. No address in it is ever requested (the only
address-shaped string left is the XHTML namespace, which Scitter's
network check already allows). Upgrading three is the same
three lines with another version, and every 3D game's tests run against it.

## Licence

```text
The MIT License

Copyright © 2010-2026 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
