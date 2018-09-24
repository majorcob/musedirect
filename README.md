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

// Create event listeners; see list of events below
muse.on("open", () => {
	// ...
})

// Start listening
muse.start()
```

## API

### `Muse` class

The `Muse` class extends `EventEmitter`. See [Node.js Events docs](https://nodejs.org/api/events.html#events_class_eventemitter) for inherited functionality.

#### `new Muse(address="127.0.0.1", port=7000)`

Constructor. In order to receive data, `.start()` must be called. `address` and `port` correspond to the UDP configuration in Muse Direct.

#### `.start()`

Begins listening for OSC messages on the UDP port specified in the constructor. This is synchronous and will block the thread until the connection is closed using `.stop()`. For this reason, make sure all of your event listeners are defined before starting.

#### `.stop()`

Closes the UDP port.

### Events

Event            | Parameters                                       | Description
-----------------|--------------------------------------------------|------------
`open`           | None                                             | UDP port is opened (but not necessarily connected to a Muse).
`close`          | None                                             | UDP port is closed.
`message`        | `msg`                                            | Any OSC message is received. See [osc.js docs](https://github.com/colinbdclark/osc.js/#messages) for `msg` object structure.
\[any OSC path\] | `args`                                           | A message with this OSC path is received. `args` is the OSC message arguments.