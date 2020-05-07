import { Server, Next, Request, Response } from 'restify';
import { BadRequestError, ConflictError, NotFoundError, ForbiddenError } from 'restify-errors';
import { format, Pool } from 'mysql';
import { v4 as uuidv4 } from 'uuid';
import { AuthorizedRequest } from './auth';

const crypto = require('crypto');

function hashPw(password: string): SaltedHash {
    const salt = uuidv4();
    const hash = crypto.createHash('sha256');
    hash.update(password + salt);
    const pwHash = hash.digest('hex');
    return { pwHash, salt };
}

//TODO: rework debug logs
export class PlayerHandler {

    private dbConnectionPool: Pool;

    constructor(server: Server, dbConnectionPool: Pool) {
        this.dbConnectionPool = dbConnectionPool;
        this.registerRoutes(server);
    }

    private registerRoutes(server: Server): void {
        server.post('/players', this.registerNewPlayer.bind(this));
        server.get('/players/:id', this.requestPlayer.bind(this));
        server.get('/players', this.requestPlayers.bind(this));
        server.put('/players/:id', this.updatePlayer.bind(this));
    }

    private registerNewPlayer(req: Request, res: Response, next: Next): any {
        const dbConnectionPool = this.dbConnectionPool;

        if (req.body.name == null || req.body.password == null) {
            return next(new BadRequestError('name or password property missing'));
        }

        dbConnectionPool.query(format('SELECT * from player where name = ?', [req.body.name]), function (err, result) {
            if (err) {
                console.log(err);
                return next(new Error(err.message));
            }
            console.log("Result query: ", result);

            if (result.length > 0) {
                return next(new ConflictError('name not available'));
            }

            const name = req.body.name;
            const secrets = hashPw(req.body.password);

            dbConnectionPool.query(format('INSERT INTO player (name, salt, pwhash) VALUES (?, ?, ?)', [name, secrets.salt, secrets.pwHash]), function (err, result) {
                if (err) {
                    console.log(err);
                    return next(new Error(err.message));
                }
                console.log("Result insert: ");
                console.log(result);

                const newPlayer = new Player({
                    id: result.insertId,
                    name: name,
                    isAdmin: false,
                    salt: secrets.salt,
                    pwhash: secrets.pwHash
                });

                res.send(201, newPlayer.getPublicProperties());
                return next();
            });
        });
    }

    private updatePlayer(req: AuthorizedRequest, res: Response, next: Next): any {
        // check payload
        if (req.body.password == null && req.body.isAdmin == null) {
            return next(new BadRequestError('at least "password" or "isAdmin" property required'));
        }

        if (req.body.isAdmin != null && typeof req.body.isAdmin !== 'boolean') {
            return next(new BadRequestError('isAdmin property has to be a boolean'));
        }

        // check authorization
        if (req.body.password != null) {
            if (req.player?.id != req.params.id && !req.player?.isAdmin) {
                return next(new ForbiddenError('password change only allowed for own user or as admin'));
            }
        }

        if (req.body.isAdmin != null && !req.player?.isAdmin) {
            return next(new ForbiddenError('isAdmin property can only be changed by admins'));
        }

        const dbConnectionPool = this.dbConnectionPool;
        const query = format('SELECT * from player WHERE id = ?', [req.params.id]);
        dbConnectionPool.query(query, function (err, resultsPlayer) {
            if (err) {
                console.log(err);
                return next(new Error(err.message));
            }
            console.log("Result: ", resultsPlayer);

            if (resultsPlayer.length === 0) {
                return next(new NotFoundError('unkown id'));
            }
            const player = new Player(resultsPlayer[0]);
            if (req.body.password != null) {
                const secrets = hashPw(req.body.password);
                player.salt = secrets.salt;
                player.pwhash = secrets.pwHash;
            }

            if (req.body.isAdmin != null) {
                player.isAdmin = req.body.isAdmin;
            }
            
            
            const updateQuery = format('UPDATE player SET pwhash = ?, salt = ?, isAdmin = ? WHERE id = ?;',
                [player.pwhash, player.salt, player.isAdmin, req.params.id]);

            // TODO: eventually move update to player object
            dbConnectionPool.query(updateQuery, function (err, resultsUpdate) {
                if (err) {
                    console.log(err);
                    return next(new Error(err.message));
                }
                console.log("Result Update: ", resultsUpdate);

                res.send(200, player.getPublicProperties());
                return next();
            });
        });
    }

    private requestPlayer(req: Request, res: Response, next: Next): any {
        const query = format('SELECT * from player WHERE id = ?', [req.params.id]);
        this.dbConnectionPool.query(query, function (err, results) {
            if (err) {
                console.log(err);
                return next(new Error(err.message));
            }
            console.log("Result: ", results);

            if (results.length === 0) {
                return next(new NotFoundError('unkown id'));
            }

            res.send(200, new Player(results[0]).getPublicProperties());
            return next();
        });
    }

    private requestPlayers(req: Request, res: Response, next: Next): any {
        let query = 'SELECT * from player;'
        if (req.query.name !== undefined) {
            query = format('SELECT * from player WHERE name LIKE ?;', ['%' + req.query.name + '%']);
        }

        this.dbConnectionPool.query(query, function (err, results) {
            if (err) {
                console.log(err);
                return next(new Error(err.message));
            }
            console.log("Result: ", results);

            res.send(200, results.map((player: IPlayer) => new Player(player).getPublicProperties()));
            return next();
        });
    }
}

interface IPlayer {
    id: number;
    name: string;
    isAdmin: boolean;
    salt?: string;
    pwhash?: string;
}

interface SaltedHash {
    pwHash: string;
    salt: string;
}

// TODO: add admin flag + extend in DB
export class Player {

    public id: number;
    public name: string;
    public isAdmin: boolean;
    public salt: string;
    public pwhash: string;

    constructor(initValues?: IPlayer) {
        this.id = initValues && initValues.id || 0
        this.name = initValues && initValues.name || ''
        this.isAdmin = initValues && initValues.isAdmin || false
        this.salt = initValues && initValues.salt || ''
        this.pwhash = initValues && initValues.pwhash || ''
    }

    public getPublicProperties(): IPlayer {
        return { id: this.id, name: this.name, isAdmin: this.isAdmin };
    }
}