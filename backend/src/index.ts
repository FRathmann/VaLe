import { createServer, Server, RequestHandler, Next, Request, Response } from 'restify';

const respond: RequestHandler = function (req: Request, res: Response, next: Next) {
    res.send('hello from VaLe to: ' + req.params.name);
    next();
}

let server: Server = createServer();

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});