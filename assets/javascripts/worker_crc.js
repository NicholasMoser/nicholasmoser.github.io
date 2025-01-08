/* Rom Patcher JS v20200502 - Marc Robledo 2016-2020 - http://www.marcrobledo.com/license */

self.importScripts(
	'./MarcFile.js',
	'./crc.js',
	'./gnt4.js'
);



self.onmessage = event => { // listen for messages from the main thread
	var dumpBytes = event.data.u8array;
	var sourceFile = new MarcFile(dumpBytes);
	console.log("crc32 -> begin")
	var crcVal = crc32(sourceFile, event.data.startOffset);
	console.log("crc32 -> end")
	// Convert known GNT4 dumps to the standard "bad dump" that the community uses 
	if (crcVal == 0x60aefa3e) {
		sourceFile.seek(0x200);
		if (sourceFile.readU32() == 0x4e4b4954) { // NKIT magic
			console.log("nkit");
			dumpBytes = patchNkit(dumpBytes);
			crcVal = 0x55ee8b1a;
		} else {
			console.log("good dump");
			dumpBytes = patchGoodDump(dumpBytes);
			crcVal = 0x55ee8b1a;
		}
	} else if (crcVal == 0x0371b18c) {
		console.log("ciso");
		dumpBytes = patchCiso(dumpBytes);
		crcVal = 0x55ee8b1a;
	}

	self.postMessage(
		{
			crc32:crcVal,
			u8array:dumpBytes
		},
		[
			dumpBytes.buffer
		]
	);
};