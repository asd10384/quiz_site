import { inRouter } from "../interfaces/Router";
import _ from "../Consts";
import { readdirSync } from "fs";
import { Request, Response, Router } from "express";
import { config } from "dotenv";

config();

interface optionstype {
  index: string,
  title: string,
  status?: number,
  url?: string,
  data?: object
};

export default class RouterHandler {
  public domain: string;
  public port: number;
  public ishttps: boolean;
  public router: Map<string, Router>;
  public go: (req: Request, res: Response, options: optionstype) => any;
  constructor () {
    this.port = (process.env.PORT) ? Number(process.env.PORT) : 0;
    this.ishttps = (process.env.ISHTTPS) ? (process.env.ISHTTPS === 'true') ? true : false : false;
    this.domain = (process.env.DOMAIN && process.env.DOMAIN !== '') ? (process.env.DOMAIN.endsWith('/')) ? process.env.DOMAIN.slice(0,-1) : process.env.DOMAIN : (this.port > 0) ? `localhost:${this.port}` : 'localhost';
    this.router = new Map();
    const routerPath = _.ROUTERS_PATH;
    const routerFiles = readdirSync(routerPath);

    for (const routerFile of routerFiles) {
      const router = new (require(_.ROUTER_PATH(routerFile)).default)() as inRouter;
      this.router.set(router.url, router.router);
    }

    this.go = (req: Request, res: Response, options: optionstype) => {
      return res.status((options.status) ? options.status : 200).render(options.index, {
        domain: this.domain,
        index: options.index,
        title: options.title,
        url: (options.url) ? this.domain+'/'+options.url : this.domain,
        data: (options.data) ? options.data : {}
      });
    }
  }
}