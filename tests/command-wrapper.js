const { spawn } = require('child_process');

const commandWrapper = async (command, commandArgs, fetcher, onFail) => {
    const handleClose = async (status, output) => {
        if (status === 0) {
            return output;
        } else {
            onFail && onFail(status);
            const suggestions = await fetcher.fetch(`${command} ${commandArgs.join(' ')}`, output)
            return { suggestions, exitCode: status }
        }
    }
    return new Promise((resolve) => {
        const child = spawn(command, commandArgs, { shell: true });
        let output = '';
        child.stdout.on('data', (data) => { output += data.toString(); });
        child.stderr.on('data', (data) => { output += data.toString(); });
        child.on('close', async (status) => {
            resolve(await handleClose(status, output));
        });
    });
}

module.exports = commandWrapper;
