import os
import sys
import subprocess
import zlib

DEFAULT_XDELTA3_PATH = 'G:/GNT/xdelta3.exe'
DEFAULT_VANILLA_PATH = 'D:/Roms/GamecubeWii/Worms 3D (USA).ciso'

if len(sys.argv) != 3:
    print('Please provide path to the previous release and the path to this release')
    sys.exit(1)
prev_scon4 = sys.argv[1]
new_scon4 = sys.argv[2]

if not os.path.isfile(prev_scon4):
    print(f'{prev_scon4} is not a valid file')
    sys.exit(1)
if not os.path.isfile(new_scon4):
    print(f'{new_scon4} is not a valid file')
    sys.exit(1)
version_name = input('Version name: ')

subprocess.call([DEFAULT_XDELTA3_PATH, "-S", 'none', '-vfs', DEFAULT_VANILLA_PATH, new_scon4, 'vanilla.xdelta'])
subprocess.call([DEFAULT_XDELTA3_PATH, "-S", 'none', '-vfs', prev_scon4, new_scon4, 'previous.xdelta'])

with open(prev_scon4, "rb") as f:
    bytes_read = f.read()
    prev_hash = zlib.crc32(bytes_read) & 0xffffffff
    hash_display = "0x%0.8x" % prev_hash

with open('patches.csv', 'w') as out:
    out.write(f'version,patch,hash\n')
    out.write(f'{os.path.basename(prev_scon4)},previous.xdelta,{hash_display}\n')

output = f'''
    patches:
      - name: 'Worms3D-Kerfuffle-{version_name}'
        file: previous.xdelta
        crc: {hash_display}
      - name: 'Worms3D-Kerfuffle-{version_name}'
        file: vanilla.xdelta
        crc: 0x9562468b
'''
print(output)

subprocess.call(['7z', 'a', '-mx=9', 'patches.zip', 'vanilla.xdelta', 'previous.xdelta', 'patches.csv'])
