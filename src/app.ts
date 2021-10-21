import RouterHandler from "./classes/RouterHandler";
import express from "express";
import path from "path";
import https from "https";
import http from "http";
import { readFileSync } from "fs";

const app: express.Application = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/ejss'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/file', express.static(path.join(__dirname, '../')));

export const { router, go, ishttps, domain, port } = new RouterHandler();

router.forEach((router) => {
  app.use(router);
});

app.use((req, res, next) => {
  return res.status(404).send({err: 'err'});
});

if (port === 0) console.error('.env port를 찾을수 없음');
if (ishttps) {
  https.createServer({
    key: readFileSync(path.join(__dirname + '../src/ssl/private.key')),
    cert: readFileSync(path.join(__dirname + '../src/ssl/certificate.crt')),
    ca: readFileSync(path.join(__dirname + '../src/ssl/ca_bundle.crt'))
  }, app).listen(port, () => {
    console.log(`사이트 오픈\nhttps://${domain}`);
  })
} else {
  http.createServer(app).listen(port, () => {
    console.log(`사이트 오픈\nhttp://${domain}`);
  });
}