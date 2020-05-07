import { RequestHandler, Next, Request, Response } from 'restify';
import { UnauthorizedError } from 'restify-errors';
import { format, Pool } from 'mysql';
import { Player } from './playerhandler';

const crypto = require('crypto');


interface WhitelistRoute {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface AuthorizedRequest extends Request {
    /** available if request has been authorized  */
    player?: Player;
}

export function authenticateBasic(whiteListRoutes: WhitelistRoute[], dbConnectionPool: Pool): RequestHandler {

    const whiteList = whiteListRoutes.map(route => `${route.method} ${route.path}`);

    return function (req: Request, res: Response, next: Next) {

        if (whiteList.includes(`${req.method} ${req.getPath()}`)) {
            return next();
        } else {
            if (req.authorization == null) {
                return next(new UnauthorizedError());
            } else {
                const query = format('SELECT * from player WHERE name = ?', [req.authorization.basic?.username]);
                dbConnectionPool.query(query, function (err, resultsPlayer) {
                    if (err) {
                        console.log(err);
                        return next(new Error(err.message));
                    }
                    console.log("Result: ", resultsPlayer);

                    if (resultsPlayer.length === 0) {
                        return next(new UnauthorizedError());
                    }
                    const player = new Player(resultsPlayer[0]);
                    const hash = crypto.createHash('sha256');
                    hash.update(req.authorization?.basic?.password + player.salt);
                    if(hash.digest('hex') === player.pwhash) {
                        (req as AuthorizedRequest).player = player;
                        return next();
                    } else {
                        return next(new UnauthorizedError());
                    }
                });
            }
        }
    }
}