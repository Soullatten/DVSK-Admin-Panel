module.exports = {
    apps: [
        {
            name: "dvsk-admin",
            script: "npm",
            args: "run dev",
            watch: false,
            // This is the magic setting that stops the black CMD window from popping up on Windows!
            env: {
                PM2_SERVE_PATH: '.',
                PM2_SERVE_PORT: 5001,
            }
        }
    ]
}