import { Router as Router } from "express";
import { inRouter } from "../interfaces/inRouter";
import { go } from "../app";
import MDB from '../databases/Mongodb';

export default class SlashRouter implements inRouter {
  /** GET */
  get: Router[] = [
    Router().get('/login(/:opt)?', async (req, res) => {
      let from = req.query.from;
      if (!from) {
        from = req.cookies.from;
      }
      let opt = req.params.opt;
      return go(req, res, {
        index: 'login',
        title: '로그인',
        url: 'login',
        islogin: true,
        data: {
          nickname: (opt && opt === 'nickname') ? true : false,
          from: (from) ? from : undefined
        }
      });
    })
  ];
  post: Router[] = [
    Router().post('/login/nickname', async (req, res) => {
      let from = req.query.from;
      let profile: any = req.user;
      let check = await MDB.module.user.findOne({ name: req.body.name });
      if (check) {
        if (check.googleid !== profile._json.sub) return res.send(`
          <script>
            alert('${req.body.name}은 사용중인 닉네임 입니다.');
            location.href = '/login/nickname${(from) ? `?from=${from}` : ''}';
          </script>
        `);
      }
      let userDB = await MDB.get.user({
        isgoogle: true,
        id: profile._json.sub,
        name: profile._json.name,
        picture: profile._json.picture
      });
      profile._json.name = req.body.name;
      if (userDB) {
        userDB.name = req.body.name;
        await userDB.save().catch((err) => console.error(err));
      }
      return res.redirect((from) ? `${from}` : '/');
    })
  ];
}