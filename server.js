const http = require('http');
const app = require('./app');

const port = process.env.PORT || 7079;

try {
    const server = http.createServer(app);
    console.log("Listening port: " + port);

    server.listen(port);
} catch (error) {
    console.log(error);
}


