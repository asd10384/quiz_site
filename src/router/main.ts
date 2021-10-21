import { Router as Router } from "express";
import { inRouter } from "../interfaces/Router";
import { router, go } from "../app";

export default class SlashRouter implements inRouter {
  /** URL */
  url: string = '/';
  /** ROUTER */
  router: Router = Router().get(this.url, async (req, res) => {
    return go(req, res, {
      index: 'main',
      title: '메인',
      url: '',
      data: {}
    });
  });
}