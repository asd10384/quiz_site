import { Router } from "express";
import { inRouter } from "../interfaces/inRouter";
import { go } from "../app";
import { Profile } from "passport-google-oauth20";

export default class SlashRouter implements inRouter {
  /** GET */
  get: Router[] = [
    Router().get('/', async (req, res) => {
      const profile = (req.user) ? getgoogleuser(req.user) : undefined;
      return go(req, res, {
        index: 'main',
        title: '메인 페이지',
        url: '',
        islogin: true,
        data: {
          name: (profile) ? profile._json.name : undefined,
          picture: (profile) ? profile._json.picture : undefined
        }
      });
    })
  ];
}

function getgoogleuser(user: any): Profile {
  return user;
}