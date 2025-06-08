module.exports = {
    authtoken: process.env.NGROK_AUTH_TOKEN,
    addr: process.env.PORT || 3000,
    proto: 'http',
    region: 'eu',
    hostname: process.env.NGROK_HOSTNAME,
    inspect: false,
    'skip-browser-warning': true,
    inspect_db: false,
    log_level: 'info',
    log_format: 'json',
    log: 'stdout',
    web_addr: false,
};
