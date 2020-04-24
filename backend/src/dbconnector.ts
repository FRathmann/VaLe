
// is this class required? remove if not!

import { createConnection, Connection, Pool, createPool } from 'mysql';
import { dbConnectionHost, dbConnectionPort, dbConnectionUser, dbConnectionPassword, dbConnectionDB, dbConnectionLimit } from './config';

var dbConnection: Connection;

export function getDbConnection(): Connection {
    if (dbConnection === undefined || dbConnection === null) {
        dbConnection = createConnection({
            host: dbConnectionHost,
            port: dbConnectionPort,
            user: dbConnectionUser,
            password: dbConnectionPassword,
            database: dbConnectionDB
        });
    }
    return dbConnection;
}

var dbConnectionPool: Pool;

export function getDbConnectionPool(): Pool {
    if (dbConnectionPool === undefined || dbConnectionPool === null) {
        dbConnectionPool = createPool({
            host: dbConnectionHost,
            port: dbConnectionPort,
            user: dbConnectionUser,
            password: dbConnectionPassword,
            database: dbConnectionDB,
            connectionLimit: dbConnectionLimit
        });
    }
    return dbConnectionPool;
}