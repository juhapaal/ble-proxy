import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import route from './routes/index';

const router: Express = express();

router.use(morgan('dev'));
router.use(express.urlencoded({extended: false}));
router.use(express.json());

router.use('/', route);

const httpServer = http.createServer(router);
const port: any = process.env.PORT ?? 3000;
httpServer.listen(port, () => { console.log('Started')});
