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
import * as socketio from "socket.io";
import MDB from "./databases/Mongodb";

config();

const app: express.Application = express();

export const { routerlist, go, ishttps, domain, port } = new RouterHandler();

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
let server: http.Server | https.Server | undefined = undefined;
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

/** socket 통신 */
const io = new socketio.Server(server);

/** MDB */
var room = { roomlist: '' };
getroom();
async function getroom() {
  let roomlist = await MDB.module.musicquiz.find();
  room.roomlist = '';
  roomlist.forEach(async (r, index) => {
    if (r.member <= 0) {
      await MDB.module.musicquiz.deleteOne({ id: r.id, name: r.name });
    } else {
      room.roomlist += `<a class="room" href="#" onclick="joinroom(this, ${r.private});">
  <div class="line"></div>
  <p class="id">${r.id}</p>
  <p class="play"><ion-icon name="ellipse"></ion-icon></p>
  <p class="name">${r.name}</p>
  <p class="type">${r.type}</p>
  <p class="member">${r.member}/${r.limit}</p>
  <p class="round">라운드 ${r.musiccount}</p>
  <p class="lock"><ion-icon name="lock-${(r.private) ? 'closed' : 'open'}"></ion-icon></p>
</a>
`;
    }
  });
  io.emit('getroom', room);
}

io.on('connection', (socket) => {
  var name: string;
  var userid: string;
  var roomid: string;
  socket.on('login', (data) => {
    console.log(`client login: ${data.name}`);
    name = data.name;
    userid = data.userid;
    roomid = data.roomid;
  });
  socket.on('getroom', async () => {
    // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
    // socket.broadcast.emit('chat', msg);

    // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
    socket.emit('getroom', room);

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    // io.emit('chat', room);

    // 특정 클라이언트에게만 메시지를 전송한다
    // io.to(userid).emit('getroom', room);
  });
  socket.on('forceDisconnect', () => {
    socket.disconnect();
  });
  socket.on('disconnect', async () => {
    if (name) {
      console.log(`client disconnect: ${name}`);
    }
    if (roomid !== '') {
      let roomDB = await MDB.module.musicquiz.findOne({ id: roomid });
      if (roomDB) {
        roomDB.member = roomDB.member - 1;
        roomDB.save().catch(err => console.error(err));
      }
    }
  });

  setInterval(async () => getroom(), 3000);




  /** test */
  socket.on('test_login', (data) => {
    console.log(`client login: {\n  name: ${data.name}\n  ID: ${data.userid}\n}`);
    name = data.name;
    userid = data.userid;
    io.emit('test_login', data.name);
  });
  socket.on('test_chat', (data) => {
    let msg = {
      from: {
        name: name,
        userid: userid
      },
      msg: data.msg
    };
    // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
    // socket.broadcast.emit('test_chat', msg);

    // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
    // socket.emit('test_chat', msg);

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    io.emit('test_chat', msg);

    // 특정 클라이언트에게만 메시지를 전송한다
    // io.to(id).emit('s2c chat', data);
  });
  socket.on('test_forceDisconnect', () => {
    socket.disconnect();
  });
  socket.on('test_disconnect', () => {
    let msg = {
      from: {
        name: '<서버>',
        userid: '00000000'
      },
      msg: `${name}님 연결 종료`
    };
    if (name) {
      console.log(`client disconnect: ${name}`);
      io.emit('test_chat', msg);
    }
  });
});