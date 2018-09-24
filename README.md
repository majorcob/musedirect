# Muse Direct

Provides an event-based interface to OSC data sent by [Muse Direct](https://www.microsoft.com/en-us/p/muse-direct/9p0mbp6nv07x).

## Installation

```sh
# TODO
```

## Usage

```js
// Import class
const Muse = require("musedirect")

// Create new instance listening at 127.0.0.1:7000
let muse = new Muse("127.0.0.1", 7000)

// Create event handlers; see list of events below
muse.on("open", () => {
	// ...
})

// Start listening
muse.start()
```

## API

### `Muse` class

TODO

### Events

Event            | Parameters                                       | Description
-----------------|--------------------------------------------------|------------
`open`           | None                                             | UDP port is opened (but not necessarily connected to a Muse).
`close`          | None                                             | UDP port is closed.
`message`        | `msg`                                            | Any OSC message is received. See [osc.js docs](https://github.com/colinbdclark/osc.js/#messages) for `msg` object structure.
\[any OSC path\] | `args`                                           | A message with this OSC path is received. `args` is the OSC message arguments.