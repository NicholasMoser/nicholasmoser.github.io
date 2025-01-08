/* MarcFile.js extensions for GameCube ISOs */

MarcFile.prototype.convertFormat = function (toFormat) {
  const fromFormat = this.romFormat();
  console.log('convertFormat from ' + fromFormat);
  if (toFormat != 'iso') {
    console.log('Only currently support converting to iso');
    return false;
  }
  if (fromFormat === toFormat) {
    return true;
  } else {
    if (fromFormat === 'nkit') { this.patchNkit(); }
    if (fromFormat === 'ciso') { this.patchCiso(); }
  }
  return this.romFormat === toFormat;
}

MarcFile.prototype.originalRomFormat = function () {
  if (this.originalFormat)
    return this.originalFormat
  else
    return this.romFormat();
}

MarcFile.prototype.readHexString = function (len) {
  this._lastRead = '';
  for (var i = 0; i < len && (this.offset + i) < this.fileSize && this._u8array[this.offset + i] > 0; i++)
    this._lastRead = this._lastRead + this._u8array[this.offset + i].toString(16);

  this.offset += len;
  return this._lastRead
}

MarcFile.prototype.romFormat = function () {
  console.log("romFormat");
  const last_offset = this.offset;
  const gameId = '47344e4a'; // G4NJ
  const cisoMagic = '4349534f'; // CISO
  const nkitMagic = '4e4b4954'; // NKIT
  this.offset = 0;
  var magic1 = this.readHexString(4);
  this.offset = 0x200;
  var magic2 = this.readHexString(4);
  this.offset = 0x8000;
  var magic3 = this.readHexString(4);
  this.offset = last_offset;
  if (magic1 == cisoMagic && magic3 == gameId) {
    var format = 'ciso'; // CISO files start with CISO and have G4NJDA at 0x8000
  } else if (magic2 == nkitMagic && magic1 == gameId) {
      var format = 'nkit'; // NKIT files have NKIT at 0x200 and start with G4NJDA
  } else {
    var format = 'iso'; // At this point if it starts with G4NJDA it is likely a GNT4 ISO
  }

  if (!this.originalFormat)
    this.originalFormat = format;
  return format;
}

MarcFile.prototype.setOutputName = function (fileName) {
  this.outputName = fileName;
}
