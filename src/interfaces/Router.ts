import { Request, Response, Router } from "express";

export interface inRouter {
  url: string,
  router: Router
}