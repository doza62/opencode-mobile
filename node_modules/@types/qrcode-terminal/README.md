# Installation
> `npm install --save @types/qrcode-terminal`

# Summary
This package contains type definitions for qrcode-terminal (https://github.com/gtanner/qrcode-terminal).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/qrcode-terminal.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/qrcode-terminal/index.d.ts)
````ts
export const error: 0 | 1 | 2 | 3;
export function generate(input: string, opts?: { small: boolean }, callback?: (qrcode: string) => void): void;
export function setErrorLevel(error: "L" | "M" | "Q" | "H"): void;

````

### Additional Details
 * Last updated: Tue, 07 Nov 2023 09:09:39 GMT
 * Dependencies: none

# Credits
These definitions were written by [Benjamin Altpeter](https://github.com/baltpeter).
