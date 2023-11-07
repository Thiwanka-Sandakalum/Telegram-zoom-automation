const { format, transports, createLogger, level, error } = require('winston');
const { combine, timestamp, printf } = format;

const combinedLogFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level} "${message}"`;
});

function prodLogger() {
    return createLogger({
        level: 'http',
        format: combine(
            format.colorize(),
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            combinedLogFormat
        ),
        transports: [
            new transports.Console()
        ],
    });
}



module.exports = prodLogger;
