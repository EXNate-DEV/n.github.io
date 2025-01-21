// development server v1 (server.mjs)

import express from 'express';
const app = express()
import * as ps from "./js/Security/Node/PolarSecurity.js";
import {PassThrough, Duplex} from 'stream';
import path from 'path';
import * as fs from 'fs'
import mime from 'mime';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const nonencryptpages = [
    "/app.html",
    "/index.html",
    "/go/OTHER/funny-shooter-2/index.html"
]

function toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return arrayBuffer;
}

app.get('/*', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return res.sendStatus(404);
        }
        let enddata = data;
        res.setHeader("Content-Type", mime.getType(req.path))
        if (req.path.endsWith(".html") && !nonencryptpages.includes(req.path)) {
            enddata = Buffer.from(ps.file_encode(data));
            res.setHeader("Content-Type", "application/octet-stream");
        }
        res.send(enddata);
        res.end();
    });
});

app.use((req,res,next)=>{
    const w = new PassThrough({
        objectMode: true,
    });
    const dup = Duplex.from({
        writable: w,
        readable: w
    })
    let result = [];
    let received = 0;
    dup.on("data", function(chunk) {
        received += 1;
        if (result === undefined) {
            result = chunk;
        } else {
            result.push(chunk);
        }
    })
    dup.on("end", function() {
        result = result[0]
        res.send(result);
        res.end();
    })
    res.on("pipe", function(src) {
        src.unpipe(res)
        src.pipe(dup)
    })
    s(req, res, function(){})
})

app.listen(3000, "0.0.0.0")