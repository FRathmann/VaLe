import { createServer, Server, RequestHandler, Next, Request, Response, plugins } from 'restify';
import { authenticateBasic } from './auth';
import { PlayerHandler } from './playerhandler';
import { getDbConnection, getDbConnectionPool } from './dbconnector';
import { SessionHandler } from './sessionhandler';

let server: Server = createServer();

let dbConPool = getDbConnectionPool();
const playerhandler = new PlayerHandler(server, dbConPool);
const sessionhandler = new SessionHandler(server, dbConPool);

//server.post('/players', (a,b,c) => {return "tbd"}); // post on players has to be whitelisted in the authentication function

server.use(plugins.authorizationParser());
server.use(authenticateBasic([{ method: 'POST', path: '/players' }], dbConPool));
server.use(plugins.bodyParser());
server.use(plugins.queryParser());

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});

/* 
TODO:
- endpoint players
- endpoint sessions
- endpoint rounds? - maybe part of sessions?
- endpoint playerstats
- auth helper functions
- default exeption handler? -> add to all functions if not available
- ???
*/