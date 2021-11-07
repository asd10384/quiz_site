import { domain, ishttps } from '../app';
import { Router as Router } from "express";
import { inRouter } from "../interfaces/inRouter";
import { go } from "../app";

export default class SlashRouter implements inRouter {
  /** GET */
  get: Router[] = [
    Router().get('/socket', async (req, res) => {
      return go(req, res, {
        index: 'socket',
        title: '실시간 정보 테스트',
        url: 'socket',
        data: {
          domain: domain.replace(/\:.*/g,'')
        },
        islogin: true,
        loginback: true
      });
    })
  ];

  /** POST */
  // post: Router[] = [
  //   Router().post('/socket', async (req, res) => {

  //   })
  // ];
}