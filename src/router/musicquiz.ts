import { Router as Router } from "express";
import { inRouter } from "../interfaces/inRouter";
import { go } from "../app";
import MDB from '../databases/Mongodb';

export default class SlashRouter implements inRouter {
  /** GET */
  get: Router[] = [
    Router().get('/musicquiz', async (req, res) => {
      return go(req, res, {
        index: 'musicquiz/main',
        title: '음악퀴즈',
        url: 'musicquiz',
        islogin: true,
        loginback: true,
        data: {
          roomid: ''
        }
      });
    }),
    Router().get('/musicquiz/:roomid', async (req, res) => {
      let roomid = req.params.roomid;
      let room: { roomid: string, check: boolean } = JSON.parse((req.signedCookies.room) ? req.signedCookies.room : JSON.stringify({ roomid: '', check: false }));
      if (room.check) {
        return go(req, res, {
          index: 'musicquiz/room',
          title: '음악퀴즈',
          url: `musicquiz/${roomid}`,
          islogin: true,
          loginback: true,
          data: {
            roomid: roomid
          }
        });
      }
    })
  ];

  /** POST */
  post: Router[] = [
    Router().post('/musicquiz', async (req, res) => {
      let { roomid, roompw } = req.body;
      let room = await MDB.module.musicquiz.findOne({ id: roomid });
      if (room) {
        if (room.private) {
          if (room.password === roompw) {
            res.cookie('room', JSON.stringify({
              roomid: roomid,
              check: true
            }), {
              maxAge: 1000 * 60 * 60 * 12,
              signed: true
            });
            room.member = room.member + 1;
            room.save().catch(err => console.error(err));
            return res.redirect(`/musicquiz/${roomid}`);
          }
          return res.send(`<script>alert('비밀번호가 다릅니다.'); location.href='/musicquiz';</script>`);
        }
        res.cookie('room', JSON.stringify({
          roomid: roomid,
          check: true
        }), {
          maxAge: 1000 * 60 * 60 * 12,
          signed: true
        });
        room.member = room.member + 1;
        room.save().catch(err => console.error(err));
        return res.redirect(`/musicquiz/${roomid}`);
      }
      return res.send(`<script>location.href='/musicquiz';</script>`);
    }),
    Router().post('/musicquiz/createroom', async (req, res) => {
      let { name, type, limit, pv, pw } = req.body;
      pv = (pv == 'on') ? true : false;
      let roomlist = await MDB.module.musicquiz.find();
      let roomid = makeroomid(roomlist.length);
      let roomDB = await MDB.get.musicquiz({
        id: roomid,
        name: name,
        type: type,
        limit: (limit < 1) ? 1 : (limit > 10) ? 10 : limit,
        member: 1,
        private: pv,
        password: (pv) ? pw : ''
      });
      if (roomDB) {
        res.cookie('room', JSON.stringify({
          roomid: roomid,
          check: true
        }), {
          maxAge: 1000 * 60 * 60 * 12,
          signed: true
        });
        return res.redirect(`/musicquiz/${roomid}`);
      }
      return res.send(`<script>alert('오류발생'); location.href='/musicquiz';</script>`);
    })
  ];
}

function makeroomid(number: number) {
  number = number + 1;
  let output: string = number.toString();
  if (number < 100) {
    output = '0' + output;
  }
  if (number < 10) {
    output = '0' + output;
  }
  return output;
}