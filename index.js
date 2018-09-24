// JACOB CAZABON 2018

const osc = require("osc")
const EventEmitter = require("events").EventEmitter

class Muse extends EventEmitter {

	constructor(address="127.0.0.1", port=7000) {

		// Built-in EventEmitter stuff
		super()

		// UDP connection info
		this.address = address
		this.port = port
		this.udp = new osc.UDPPort({
			localAddress: this.address,
			localPort: this.port
		})

	}

	start() {

		// Open connection
		this.udp.on("ready", () => {
			this.emit("open")
		})

		// Emit generic message and OSC address events
		this.udp.on("message", (message) => {
			this.emit("message", message)
			this.emit(message.address, message.args)
		})

		this.udp.open()

	}

	stop() {

		// Close connection
		this.udp.close()
		this.emit("close")

	}

}

module.exports = Muse