import { Router as Router } from "express";
import { inRouter } from "../interfaces/inRouter";
import { go } from "../app";

export default class SlashRouter implements inRouter {
  /** GET */
  get: Router[] = [
    Router().get('/logout', async (req, res) => {
      req.session.destroy((err) => {
        req.logout();
        res.redirect('/');
      });
    })
  ];
}