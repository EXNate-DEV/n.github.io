// development server v1 (server.mjs)

import express from 'express';
const app = express()

app.use(express.static("."))

app.listen(3000, "0.0.0.0")