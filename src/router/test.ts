import { Router as Router } from "express";
import { inRouter } from "../interfaces/Router";
import { router, go } from "../app";

export default class SlashRouter implements inRouter {
  /** URL */
  url: string = '/test';
  /** ROUTER */
  router: Router = Router().get(this.url, async (req, res) => {
    return res.send('test text');
  });
}