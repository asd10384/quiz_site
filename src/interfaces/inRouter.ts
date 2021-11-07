import { Request, Response, Router } from "express";

export interface inRouter {
  get?: Router[],
  post?: Router[]
}
