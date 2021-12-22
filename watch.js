const { spawn } = require('child_process');
const concurrently = require('concurrently');

const isWin = process.platform === "win32";

const child = isWin ? spawn("del", ["/s", "/F", "/Q", "lib"]) : spawn("rm", ["-rf", "lib"]);

child.on('exit', function (code, signal) {
    console.log('child process exited with ' + `code ${code} and signal ${signal}`);

    concurrently(
        [
            { name: 'SASS', command: 'yarn copy-scss' },
            { name: 'CJS/DOM', command: 'tsc -w -p tsconfig-cjs-dom.json' },
            { name: 'ESM/DOM', command: 'tsc -w -p tsconfig-esm-dom.json' },
            { name: 'CJS/NAT', command: 'tsc -w -p tsconfig-cjs-native.json' },
            { name: 'ESM/NAT', command: 'tsc -w -p tsconfig-esm-native.json' },
        ],
        {
            prefix: 'name',
        }
    )
});

