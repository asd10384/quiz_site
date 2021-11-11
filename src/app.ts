import { config } from "dotenv";
import RouterHandler from "./classes/ServerHandler";
import express from "express";
import passport from "passport";
import path from "path";
import https from "https";
import http from "http";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import { readFileSync } from "fs";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import socketio from "./socket/socket";

config();

const app: express.Application = express();

export const { routerlist, go, getgoogleuser, ishttps, domain, port } = new RouterHandler();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/ejss'));

app.use(express.json());
app.use(cors({ origin: `http://${domain}`, credentials: true }));
app.use(session({
  secret: (process.env.SESSION_SECRET) ? process.env.SESSION_SECRET : 'session',
  resave: true,
  saveUninitialized: true
}));
app.use(cookieParser((process.env.COOKIE_SECRET) ? process.env.COOKIE_SECRET : 'cookie'));
app.use(express.urlencoded({ extended: false }));
app.use('/file', express.static(path.join(__dirname, '../')));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(async (user: any, done: any) => {
  return done(null, user);
});
passport.deserializeUser((user: any, done: any) => {
  return done(null, user);
});
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_OAUTH_CLIENTID!,
  clientSecret: process.env.GOOGLE_OAUTH_CLIENTSECRET!,
  callbackURL: `http${(ishttps) ? 's' : ''}://${domain}/auth/google/callback`
}, async (accessToken: any, refreshToken: any, profile: Profile | undefined, cb: any) => {
  return cb(null, profile);
}));
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/login/nickname');
});

routerlist.forEach((routerlist) => {
  app.use(routerlist);
});

app.use((req, res, next) => {
  return go(req, res, {
    index: 'err',
    title: 'error',
    status: 404
  });
});

if (port === 0) console.error('.env port를 찾을수 없음');
export let server: http.Server | https.Server | undefined = undefined;
if (ishttps) {
  server = https.createServer({
    key: readFileSync(path.join(__dirname, '../src/ssl/private.key')),
    cert: readFileSync(path.join(__dirname, '../src/ssl/certificate.crt')),
    ca: readFileSync(path.join(__dirname, '../src/ssl/ca_bundle.crt'))
  }, app).listen(port, () => {
    console.log(`사이트 오픈\nhttps://${domain}`);
  });
} else {
  server = http.createServer(app).listen(port, () => {
    console.log(`사이트 오픈\nhttp://${domain}`);
  });
}

/** 소켓 연결 */
socketio(server);