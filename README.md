# Muse Direct  [![npm](https://img.shields.io/npm/v/musedirect.svg?style=flat-square)](https://npmjs.org/musedirect)

Provides an event-based interface to OSC data sent by [Muse Direct](https://www.microsoft.com/en-us/p/muse-direct/9p0mbp6nv07x).

## Installation

```sh
npm install musedirect --save
```

## Usage

```js
// Import class
const Muse = require("musedirect");

// Create new instance listening at 127.0.0.1:7000
let muse = new Muse("/Person0", "127.0.0.1", 7000);

// Create event listeners; see list of events below
muse.on("open", () => {
	// ...
});

// Start listening
muse.start();
```

### Note about OSC paths

As of Muse Direct on Windows version 0.19.1, the default OSC output uses message addresses with the format `Person0/eeg/0`, where `Person0` is the name of the Muse device. **This will cause issues with osc.js**, as paths without a leading slash are not considered valid. There are two workarounds for this:

1. Change the name of the device to begin with a leading slash (e.g. `Person0` → `/Person0`), then pass the string `"/Person0"` as the `prefix` parameter to the `Muse` class constructor.

2. Disable the default OSC output and create a new one. Set the prefix to a custom text value, which will be the `prefix` string passed to the `Muse` class constructor. This can be en empty string as well, which is the default value for `prefix.` If the prefix is not empty, then it must begin with a slash such that the resulting OSC paths also have a leading slash.

## API

### `Muse` class

The `Muse` class extends `EventEmitter`. See [Node.js Events docs](https://nodejs.org/api/events.html#events_class_eventemitter) for inherited functionality.

#### `new Muse(prefix="", address="127.0.0.1", port=7000)`

Constructor. In order to receive data, `.start()` must be called. `address` and `port` correspond to the UDP configuration in Muse Direct. `prefix` is the name that may be added by Muse Direct before each OSC address (see the note above regarding OSC paths).

#### `.start()`

Begins listening for OSC messages on the UDP port specified in the constructor. This is synchronous and will block the thread until the connection is closed using `.stop()`. For this reason, make sure all of your event listeners are defined before starting.

#### `.stop()`

Closes the UDP port.

### Events

Event            | Parameters                                       | Description
-----------------|--------------------------------------------------|------------
`open`           | None                                             | UDP port is opened (but not necessarily connected to a Muse).
`close`          | None                                             | UDP port is closed.
`connect`        | None                                             | A Muse has connected and is sending data. Checked every 250 ms.
`disconnect`     | None                                             | A Muse has lost connection and/or is no longer sending data. Checked every 250 ms.
`message`        | `msg`                                            | Any OSC message is received. Any prefix specified in the `Muse` class constructor is kept in the address. See [osc.js docs](https://github.com/colinbdclark/osc.js/#messages) for `msg` object structure.
\[any OSC path\] | `args`                                           | A message with this OSC path is received. Any prefix specified in the constructor is removed, leaving only the relevant OSC path. `args` is the OSC message arguments. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct) for available OSC paths.
`eeg raw`        | `tp9`, `af7`, `af8`, `tp10`                      | Raw EEG data is received. Arguments are μV values for each channel. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#Raw_EEG).
`eeg filtered`   | `tp9`, `af7`, `af8`, `tp10`                      | EEG data put through a band-stop filter. Arguments are μV values for each channel. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#Notch_Filtered_EEG).
`eeg stepsize`   | `stepsize`                                       | Quantization step size is received for Muse 2014 data compression. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#EEG_Quantization_Level).
`accel data`     | `accelX`, `accelY`, `accelZ`                     | Accelerometer data is received. Arguments are g values for X (+forward), Y (+right), and Z (+downward) axes. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#Raw_Accelerometer_Data).
`gyro data`      | `rollRate`, `pitchRate`, `yawRate`               | Gyroscope data is received. Arguments are °/s (angular velocity) values for roll (+tilting right), pitch (+looking up), and yaw (+looking right). See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#Raw_Gyroscope_Data).
`delta abp`      | `tp9`, `af7`, `af8`, `tp10`                      | Absolute Band Power for a frequency range is received. Arguments are the ABP for each channel, in bels. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#Absolute_Band_Powers). Includes `delta abp`, `theta abp`, `alpha abp`, `beta abp`, and `gamma abp`.
`delta rbp`      | `tp9`, `af7`, `af8`, `tp10`                      | Relative Band Power for a frequency range is received. Arguments are the RBP for each channel, in bels. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#Relative_Band_Powers). Includes `delta rbp`, `theta rbp`, `alpha rbp`, `beta rbp`, and `gamma rbp`.
`delta score`    | `tp9`, `af7`, `af8`, `tp10`                      | The session score for a frequency range is received. Arguments are the score for each channel, from 0 (negligible presence) to 1 (significant presence). See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#Band_Power_Session_Scores). Includes `delta score`, `theta score`, `alpha score`, `beta score`, and `gamma score`.
`contact made`   | None                                             | Contact with the forehead is established.
`contact lost`   | None                                             | Contact with the forehead is lost.
`contact status` | `isTouching`                                     | Forehead contact status is received. Argument is `true` if contact is made, `false` otherwise. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#Headband_On_Touching_Forehead).
`channel status` | `leftEar`, `leftFront`, `rightFront`, `rightEar` | EEG channel status is received. Arguments are `true` for good quality and `false` otherwise for each channel. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#Real_Time_EEG_Quality).
`battery status` | `decimal`, `voltage`, `temperature`              | Battery status is received. `decimal` is the battery power from 0 (dead) to 1 (full charge). `voltage` is the voltage through the battery in mV. `temperature` is the battery temperature in °C. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#BatteryData).
`drl status`     | `drl`, `ref`                                     | DRL status is received. Arguments are the DRL and reference voltages in μV. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#DRLRefData).
`blink`          | None                                             | A blink was detected. Note that the OSC behavior will always send a Boolean value at 10 Hz, but in this case the event is only fired if a blink is detected. For the OSC behaviour, see the `blink status` event below. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#Blinks).
`blink status`   | `blinking`                                       | Blink status is received; argument is `true` if the wearer is blinking and `false` otherwise.
`jaw clench`     | None                                             | A jaw clench was detected. Note that the OSC behavior will always send a Boolean value at 10 Hz, but in this case the event is only fired if a jaw clench is detected. For the OSC behaviour, see the `jaw clench status` event below. See [Muse docs](http://developer.choosemuse.com/tools/windows-tools/available-data-muse-direct#Jaw_Clenches).
`jaw clench status` | `clenching`                                   | Jaw clench status is received; argument is `true` if the wearer's jaw is clenched and `false` otherwise.

## License

[MIT](https://opensource.org/licenses/MIT)
