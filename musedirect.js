// JACOB CAZABON 2018

const osc = require("osc");
const EventEmitter = require("events").EventEmitter;

class Muse extends EventEmitter {

    constructor(prefix="", address="127.0.0.1", port=7000) {

        // Built-in EventEmitter stuff
        super();

        // UDP connection info
        this.prefix = prefix;
        this.address = address;
        this.port = port;
        this.udp = new osc.UDPPort({
            localAddress: this.address,
            localPort: this.port
        });

        // Timeout duration, in ms
        this.timeout = 250;

        // Connected status tracker
        this.connected = false;
        this.lastMessage = Date.now();
        this.connectInterval = null;

        // Blink/jaw clench trackers to avoid duplicate events
        this.blinked = false;
        this.clenched = false;

        // Forehead contact tracker
        this.touching = false;

    }

    start() {

        // Open connection and then start timer
        this.udp.on("ready", () => {
            this.emit("open");
            this.connectInterval = setInterval(() => {

                // Connected and timeout passed, then disconnect
                if (this.connected && Date.now() - this.lastMessage > this.timeout) {
                    this.connected = false;
                    this.emit("disconnect");
                } else if (!this.connected && Date.now() - this.lastMessage <= this.timeout) {
                    this.connected = true;
                    this.emit("connect");
                }

            }, this.timeout);
        });

        // Emit generic message and OSC address events, and confirm connection
        this.udp.on("message", (msg) => {
            if (msg.address.startsWith(this.prefix + "/")) {
                this.lastMessage = Date.now();
                this.emit("message", msg);
                this.emit(msg.address.substring(this.prefix.length), msg.args);
            }
        });

        // Raw EEG data is received
        this.on("/eeg", (args) => {
            let [tp9, af7, af8, tp10] = args;
            this.emit("eeg raw", tp9, af7, af8, tp10);
        });

        // Filtered EEG data is received
        this.on("/notch_filtered_eeg", (args) => {
            let [tp9, af7, af8, tp10] = args;
            this.emit("eeg filtered", tp9, af7, af8, tp10);
        });

        // EEG quantizer is received
        this.on("/eeg/quantization", (args) => {
            let [stepsize] = args;
            this.emit("eeg stepsize", stepsize);
        });

        // Accelerometer data is received
        this.on("/acc", (args) => {
            let [accelX, accelY, accelZ] = args;
            this.emit("accel data", accelX, accelY, accelZ);
        });

        // Gyroscope data is received
        this.on("/gyro", (args) => {
            let [rollRate, pitchRate, yawRate] = args;
            this.emit("gyro data", rollRate, pitchRate, yawRate);
        });

        // For each band:
        ["delta", "theta", "alpha", "beta", "gamma"].forEach((band) => {

            // Absolute band power is received
            this.on(`/elements/${band}_absolute`, (args) => {
                let [tp9, af7, af8, tp10] = args;
                this.emit(`${band} abp`, tp9, af7, af8, tp10);
            });

            // Relative band power is received
            this.on(`/elements/${band}_relative`, (args) => {
                let [tp9, af7, af8, tp10] = args;
                this.emit(`${band} rbp`, tp9, af7, af8, tp10);
            });

            // Session score is received
            this.on(`/elements/${band}_session_score`, (args) => {
                let [tp9, af7, af8, tp10] = args;
                this.emit(`${band} score`, tp9, af7, af8, tp10);
            });
        });

        // Forehead contact status is received
        this.on("/elements/touching_forehead", (args) => {
            let [isTouching] = args;
            this.emit("contact status", !!isTouching);
            if (isTouching && !this.touching) {
                this.touching = true;
                this.emit("contact made");
            } else if (!isTouching && this.touching) {
                this.touching = false;
                this.emit("contact lost");
            }
        });

        // Sensor statuses are received
        this.on("/elements/is_good", (args) => {
            let [leftEar, leftFront, rightFront, rightEar] = args;
            this.emit("channel status", !!leftEar, !!leftFront, !!rightFront, !!rightEar);
        });

        // Battery status is received
        this.on("/batt", (args) => {
            let [decimal, voltage, temperature] = args;
            this.emit("battery status", decimal / 10000, voltage, temperature);
        });

        // DRL reference voltages are received
        this.on("/drlref", (args) => {
            let [drl, ref] = args;
            this.emit("drl status", drl, ref);
        });

        // Blink presence is received
        this.on("/elements/blink", (args) => {
            let [blinking] = args;
            this.emit("blink status", !!blinking);
            if (blinking && !this.blinked) {
                this.blinked = true;
                this.emit("blink");
            } else if (!blinking && this.blinked) {
                this.blinked = false;
            }
        });

        // Jaw clench presence is received
        this.on("/elements/jaw_clench", (args) => {
            let [clenching] = args;
            this.emit("jaw clench status", !!clenching);
            if (clenching && !this.clenched) {
                this.clenched = true;
                this.emit("jaw clench");
            } else if (!clenching && this.clenched) {
                this.clenched = false;
            }
        });

        this.udp.open();

    }

    stop() {

        // Close connection
        this.udp.close();
        clearInterval(this.connectInterval);
        this.emit("close");

    }

}

module.exports = Muse;
