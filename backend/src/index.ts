import { createServer, Server, RequestHandler, Next, Request, Response, plugins } from 'restify';
import { PlayerHandler } from './playerhandler';
import { getDbConnection, getDbConnectionPool } from './dbconnector';

const respond: RequestHandler = function (req: Request, res: Response, next: Next) {
    res.send('hello from VaLe to: ' + req.params.name);
    next();
}

let server: Server = createServer();

// let dbconnection = getDbConnection();
// dbconnection.connect(function(err) {
//     if (err) throw err;
    
//     const playerHandler = new PlayerHandler(server, dbconnection);
// });

let dbConPool = getDbConnectionPool();
const playerhandler = new PlayerHandler(server, dbConPool);

//server.post('/players', (a,b,c) => {return "tbd"}); // post on players has to be whitelisted in the authentication function

server.use(//Authentication here
    // - auth parser: http://restify.com/docs/plugins-api/#authorizationParser
    );
server.use(plugins.bodyParser());
server.use(plugins.queryParser());



server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});

/* 
TODO:
- endpoint players
- endpoint sessions
- endpoint rounds? - maybe part of sessions?
- endpoint playerstats
- default exeption handler? -> add to all functions if not available
- ???
*/