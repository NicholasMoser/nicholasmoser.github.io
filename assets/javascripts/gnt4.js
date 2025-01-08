
function patchGoodDump(_u8array) {
    console.log("patchGoodDump -> start");
  
    // First write this weird four byte word to bi2.bin
    _u8array[0x500] = 0x00;
    _u8array[0x501] = 0x52;
    _u8array[0x502] = 0x02;
    _u8array[0x503] = 0x02;
  
    console.log("patchGoodDump -> end");

    // There are random padding bytes from 0x248104 to 0xC4F8000 (0xC2AFEFC bytes).
    // Replace them with zeroes by looping 49839 times. Then add 3836 extra zeroes.
    for (var i = 0x248104; i < 0xC4F8000; i++) {
      _u8array[i] = 0;
    }

    // There are random padding bytes from 0x4553001C - 0x45532B7F (0x2B63 bytes).
    // Just add 11108 zeroes directly.
    for (var i = 0x4553001C; i < 0x45532B80; i++) {
      _u8array[i] = 0;
    }

    console.log("patchGoodDump -> end");
    return _u8array;
  }
  
function patchNkit(_u8array) {
  console.log("patchNkit -> start");
  var newBytes = new Uint8Array(0x57058000);

  // Copy sys bytes
  for (var i = 0; i < 0x2480F0; i++) {
    newBytes[i] = _u8array[i];
  }

  // Fix sys bytes
  for (var i = 0x200; i < 0x214; i++) {
    newBytes[i] = 0;
  }
  newBytes[0x500] = 0x00;
  newBytes[0x501] = 0x52;
  newBytes[0x502] = 0x02;
  newBytes[0x503] = 0x02;

	// Fix file system table (fst.bin)
	var skip = [0x245250, 0x24525C, 0x24612C, 0x2462B8, 0x246660, 0x246720];
	for (var i = 0x244D28; i < 0x246760; i += 0xC) {
		if (!(skip.includes(i))) {
			const buff = new DataView(new ArrayBuffer(4));
			buff.setInt8(0, _u8array[i]);
			buff.setInt8(1, _u8array[i + 1]);
			buff.setInt8(2, _u8array[i + 2]);
			buff.setInt8(3, _u8array[i + 3]);
			var offset = buff.getUint32();
			var new_offset = offset + 0xC2A8000;
			if (i >= 0x245268) {
				new_offset += 0x2B7C;
			}
			buff.setInt32(0, new_offset);
			newBytes[i] = buff.getInt8(0);
			newBytes[i + 1] = buff.getInt8(1);
			newBytes[i + 2] = buff.getInt8(2);
			newBytes[i + 3] = buff.getInt8(3);
		}
	}
  newBytes[0x2480E8] = 0;
  newBytes[0x2480E9] = 0;
  newBytes[0x2480EA] = 0;
  newBytes[0x2480EB] = 0;
  
  // Copy the rest of the files over
  var offset = 0xC2A8000;
  for (var i = 0x250000; (offset + i) < 0x57058000; i++) {
    newBytes[i + offset] = _u8array[i];
    if (i == 0x39288000) {
      offset += 0x2B7C;
    }
  }
  
	// Last little bit of cleanup
	newBytes[0x45532B7E] = 0;
	newBytes[0x45532B7F] = 0;

  console.log("patchNkit -> end");
  return newBytes;
  }
  
function patchCiso(_u8array) {
    console.log("patchCiso -> start");
    var newBytes = new Uint8Array(0x57058000);
  
    // Copy sys bytes
    for (var i = 0; i < 0x2480F0; i++) {
      newBytes[i] = _u8array[i + 0x8000]; // ciso sys starts at 0x8000
    }
  
    // Fix sys bytes
    for (var i = 0x200; i < 0x214; i++) {
      newBytes[i] = 0;
    }
    newBytes[0x500] = 0x00;
    newBytes[0x501] = 0x52;
    newBytes[0x502] = 0x02;
    newBytes[0x503] = 0x02;
  
    // Copy the rest of the files over
    var offset = 0xBFF8000;
    for (var i = 0x500000; (offset + i) < 0x57058000; i++) {
      newBytes[i + offset] = _u8array[i];
    }
  
    // Zero out padding bytes from 0x4553001C - 0x45532B7F (0x2B63 bytes).
    for (var i = 0x4553001C; i < 0x45532B80; i++) {
      newBytes[i] = 0;
    }
  
    console.log("patchCiso -> end");
    return newBytes;
  }