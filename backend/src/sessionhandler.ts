import { Server, RequestHandler, Next, Request, Response } from 'restify';
import { BadRequestError, ConflictError, NotFoundError } from 'restify-errors';
import { format, Pool } from 'mysql';
import { AuthorizedRequest } from './auth';


//TODO: rework debug logs
export class SessionHandler {

    private dbConnectionPool: Pool;

    constructor(server: Server, dbConnectionPool: Pool) {
        this.dbConnectionPool = dbConnectionPool;
        this.registerRoutes(server);
    }

    private registerRoutes(server: Server): void {
        server.post('/sessions', this.addNewSession.bind(this));
        server.get('/sessions/:id', this.requestSession.bind(this));
        server.get('/sessions', this.requestSessions.bind(this));
        // server.del('/sessions/:id', this.removeSession.bind(this));
        // server.put('/sessions/:id', this.updateSession.bind(this));
        // server.post('/sessions/:id/rounds', this.addroundToSession.bind(this));
    }

    private addNewSession(req: Request, res: Response, next: Next): any {
        // TODO: check for duplicate session name (required?)
        // TODO: eventually authorize

        if (req.body.name == null || req.body.name === '' || typeof req.body.name !== 'string') {
            return next(new BadRequestError('name property has to be an non empty string'));
        }

        this.dbConnectionPool.query(format('INSERT INTO session (name, finished, timestamp) VALUES (?, ?, NOW())',
                                           [req.body.name, false]), function (err, result) {
            if (err) {
                console.log(err);
                return next(new Error(err.message));
            }
            console.log("Result insert: ");
            console.log(result);

            const newSession = new Session({
                id: result.insertId,
                name: req.body.name,
                finished: false,
                timestamp: result.timestamp
            });

            res.send(201, newSession);
            return next();
        });
    }

    private requestSessions(req: Request, res: Response, next: Next): any {
        const query = ['SELECT * from session'];
        const queryVariables = [];

        // check parameters type
        if (req.query.finished != null) {
            if (!['0', '1', 'false'].includes(req.query.finished)) {
                if (req.query.finished === 'true') req.query.finished = 1;
                else req.query.finished = -1;
            }
        }

        if (req.query.name !== undefined || req.query.finished !== undefined) {
            query.push(' WHERE ');
            if (req.query.name !== undefined) {
                query.push('name LIKE ?');
                queryVariables.push('%' + req.query.name + '%');
                if (req.query.finished !== undefined) {
                    query.push(' AND ');
                }
            }
            if (req.query.finished !== undefined) {
                query.push('finished = ?');
                queryVariables.push(req.query.finished);
            }
        }
        query.push(';');
        const generatedQuery = format(query.join(''), queryVariables);

        this.dbConnectionPool.query(generatedQuery, function (err, results) {
            if (err) {
                console.log(err);
                return next(new Error(err.message));
            }
            console.log("Result: ", results);

            res.send(200, results.map((session: any) => new Session(session)));
            return next();
        });
    }
    
    private requestSession(req: Request, res: Response, next: Next): any {
        const query = format('SELECT * from session WHERE id = ?', [req.params.id]);
        this.dbConnectionPool.query(query, function (err, results) {
            if (err) {
                console.log(err);
                return next(new Error(err.message));
            }
            console.log("Result: " + results);

            if (results.length === 0) {
                return next(new NotFoundError('unkown id'));
            }

            res.send(200, new Session(results[0]));
            return next();
        });
    }
}

//     private registerNewPlayer(req: Request, res: Response, next: Next): any {
//         const dbConnectionPool = this.dbConnectionPool;

//         if (req.body.name == null || req.body.password == null) {
//             return next(new BadRequestError('name or password property missing'));
//         }

//         dbConnectionPool.query(format('SELECT * from player where name = ?', [req.body.name]), function (err, result) {
//             if (err) {
//                 console.log(err);
//                 return next(new Error(err.message));
//             }
//             console.log("Result query: " + result);

//             if (result.length > 0) {
//                 return next(new ConflictError('name not available'));
//             }

//             const name = req.body.name;
//             const secrets = hashPw(req.body.password);

//             dbConnectionPool.query(format('INSERT INTO player (name, salt, pwhash) VALUES (?, ?, ?)', [name, secrets.salt, secrets.pwHash]), function (err, result) {
//                 if (err) {
//                     console.log(err);
//                     return next(new Error(err.message));
//                 }
//                 console.log("Result insert: ");
//                 console.log(result);

//                 const newPlayer = new Player({
//                     id: result.insertId,
//                     name: name,
//                     isAdmin: false,
//                     salt: secrets.salt,
//                     pwHash: secrets.pwHash
//                 });

//                 res.send(201, newPlayer.getPublicProperties());
//                 return next();
//             });
//         });
//     }

//     private updatePlayer(req: Request, res: Response, next: Next): any {
//         // TODO: authorize request
//         // - update password only allowed for own user or admin
//         // - changing admin flag only allowed for admins
//         if (req.body.password == null && req.body.isAdmin == null) {
//             return next(new BadRequestError('at least "password" or "isAdmin" property required'));
//         }

//         if (req.body.isAdmin != null && typeof req.body.isAdmin !== 'boolean') {
//             return next(new BadRequestError('isAdmin property has to be a boolean'));
//         }

//         const dbConnectionPool = this.dbConnectionPool;
//         const query = format('SELECT * from player WHERE id = ?', [req.params.id]);
//         dbConnectionPool.query(query, function (err, resultsPlayer) {
//             if (err) {
//                 console.log(err);
//                 return next(new Error(err.message));
//             }
//             console.log("Result: " + resultsPlayer);

//             if (resultsPlayer.length === 0) {
//                 return next(new NotFoundError('unkown id'));
//             }
//             const player = new Player(resultsPlayer[0]);
//             if (req.body.password != null) {
//                 const secrets = hashPw(req.body.password);
//                 player.salt = secrets.salt;
//                 player.pwHash = secrets.pwHash;
//             }

//             if (req.body.isAdmin != null) {
//                 player.isAdmin = req.body.isAdmin;
//             }
            
            
//             const updateQuery = format('UPDATE player SET pwhash = ?, salt = ?, isAdmin = ? WHERE id = ?;',
//                 [player.pwHash, player.salt, player.isAdmin, req.params.id]);

//             // TODO: eventually move update to player object
//             dbConnectionPool.query(updateQuery, function (err, resultsUpdate) {
//                 if (err) {
//                     console.log(err);
//                     return next(new Error(err.message));
//                 }
//                 console.log("Result Update: " + resultsUpdate);

//                 res.send(200, player.getPublicProperties());
//                 return next();
//             });
//         });
//     }

//     private requestPlayer(req: Request, res: Response, next: Next): any {
//         const query = format('SELECT * from player WHERE id = ?', [req.params.id]);
//         this.dbConnectionPool.query(query, function (err, results) {
//             if (err) {
//                 console.log(err);
//                 return next(new Error(err.message));
//             }
//             console.log("Result: " + results);

//             if (results.length === 0) {
//                 return next(new NotFoundError('unkown id'));
//             }

//             res.send(200, new Player(results[0]).getPublicProperties());
//             return next();
//         });
//     }

//     private requestPlayers(req: Request, res: Response, next: Next): any {
//         let query = 'SELECT * from player;'
//         if (req.query.name !== undefined) {
//             query = format('SELECT * from player WHERE name LIKE ?;', ['%' + req.query.name + '%']);
//         }

//         this.dbConnectionPool.query(query, function (err, results) {
//             if (err) {
//                 console.log(err);
//                 return next(new Error(err.message));
//             }
//             console.log("Result: " + results);

//             res.send(200, results.map((player: IPlayer) => new Player(player).getPublicProperties()));
//             return next();
//         });
//     }
// }

interface ISessionInit {
    id: number,
    name: string,
    timestamp: string,
    finished: boolean
}

class Session {
    public id: number;
    public name: string;
    public timestamp: Date;
    public finished: boolean;
    public rounds: any[]; // TODO: replace by round type when available

    constructor(initValues: ISessionInit) {
        this.id = initValues.id;
        this.name = initValues.name;
        this.timestamp = new Date(initValues.timestamp);
        this.finished = initValues.finished;
        this.rounds = [];
    }
}
