const { listStreamDecks, getStreamDeckInfo } = require('elgato-stream-deck')

console.log('Devices: ', listStreamDecks())

for (const device of listStreamDecks()) {
	console.log('Device', device)
	console.log('Details', getStreamDeckInfo(device.path))
}
