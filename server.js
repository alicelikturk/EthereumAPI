const http = require('http');
const app = require('./app');


const port = process.env.PORT || 7079;

try {
    
   
    
    const server = http.createServer(app);
    server.listen(port,()=>console.log("Listening port: " + port));

} catch (error) {
    console.log(error);
}


