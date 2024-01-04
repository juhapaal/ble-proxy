import express from 'express';
import { Request, Response, NextFunction } from 'express';
//import axios, { AxiosResponse } from 'axios';

const router = express.Router();
router.post('/gs01', async (req: Request, resp: Response, next: NextFunction) => {
    //const foo = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
    //return resp.send(foo.data);
    console.log(req.body);
    resp.send("");
});

export default router;