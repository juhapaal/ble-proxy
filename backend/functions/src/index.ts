/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import { Express, Request, Response } from 'express';
import * as express  from 'express';
import * as bodyParser from 'body-parser';
import * as prom from 'prom-client';

const register = new prom.Registry();
register.setDefaultLabels({
    app: 'ble-proxy'
});
const tempGauge = new prom.Gauge({ name: 'temperature', help: 'Temperature', labelNames: ['tagId', 'gatewayId'], registers: [register] });
const humidGauge = new prom.Gauge({ name: 'humidity', help: 'Humidity', labelNames: ['tagId', 'gatewayId'], registers: [register] });
const batteryGauge = new prom.Gauge({ name: 'battery', help: 'Battery', labelNames: ['tagId', 'gatewayId'], registers: [register] });
const rssiGauge = new prom.Gauge({ name: 'rssi', help: 'RSSI', labelNames: ['tagId', 'gatewayId'], registers: [register] });
const rangeGauge = new prom.Gauge({ name: 'range', help: 'Range', labelNames: ['tagId', 'gatewayId'], registers: [register] });

const router: Express = express();

router.use(express.urlencoded({extended: false}));
router.use(express.json());
router.post('/gs01', bodyParser.text({type: "text/plain"}), (req: Request, resp: Response) => { 
    let [protocol, tag, gateway, rssi, payload] = req.body.split(',');
    console.log(req.body);
    
    if (protocol === '$GPRP') {
        const parser = require('@ingics/message-parser');
        var log = parser.parsePayload(payload);
        if (log) {
            rssiGauge.labels(tag, gateway).set(Number(rssi));            
            batteryGauge.labels(tag, gateway).set(Number(log.manufacturerData.battery));

            switch (log.manufacturerData.type) {
                case 'iBS01T': {
                    tempGauge.labels(tag, gateway).set(Number(log.manufacturerData.temperature));
                    humidGauge.labels(tag, gateway).set(Number(log.manufacturerData.humidity));
                    break;
                }
                case 'iBS03R': {
                    rangeGauge.labels(tag, gateway).set(Number(log.manufacturerData.range));
                    break;
                }
                default: 
                    console.log(log.manufacturerData);
                    break;
            }
        }
    } else {
        console.log(`Unknown msg ${req.body}`);
    }
    resp.send("");
});

router.get('/metrics', async (req, resp) => {
    resp.setHeader('Content-Type', register.contentType);
    resp.send(await register.metrics());
});

exports.router = onRequest(router);
