import { inRouter } from "../interfaces/inRouter";
import _ from "../Consts";
import { readdirSync } from "fs";
import { Request, Response, Router } from "express";
import { config } from "dotenv";
import MDB from '../databases/Mongodb';
import * as User from '../databases/objs/User';
import { Profile } from "passport-google-oauth20";

config();

interface optionstype {
  index: string,
  title: string,
  islogin?: boolean,
  loginback?: boolean,
  status?: number,
  url?: string,
  data?: object
};

export default class ServerHandler {
  public domain: string;
  public port: number;
  public isport: boolean;
  public ishttps: boolean;
  public routerlist: Router[];
  public go: (req: Request, res: Response, options: optionstype) => any;
  public getgoogleuser: (user: any) => Profile;
  constructor () {
    this.isport = (process.env.ISPORT) ? (process.env.ISPORT === 'true') ? true : false : false;
    this.port = (process.env.PORT) ? Number(process.env.PORT) : 0;
    this.ishttps = (process.env.ISHTTPS) ? (process.env.ISHTTPS === 'true') ? true : false : false;
    this.domain = (process.env.DOMAIN && process.env.DOMAIN !== '') ? (process.env.DOMAIN.endsWith('/')) ? `${process.env.DOMAIN.slice(0,-1)}${(this.isport) ? `:${this.port}` : ''}` : `${process.env.DOMAIN}${(this.isport) ? `:${this.port}` : ''}` : (this.port > 0) ? `localhost:${this.port}` : 'localhost';
    this.routerlist = [];
    const routerPath = _.ROUTERS_PATH;
    const routerFiles = readdirSync(routerPath);

    for (const routerFile of routerFiles) {
      const router = new (require(_.ROUTER_PATH(routerFile)).default)() as inRouter;
      if (router.get) this.routerlist = this.routerlist.concat(router.get);
      if (router.post) this.routerlist = this.routerlist.concat(router.post);
    }

    this.go = async (req: Request, res: Response, options: optionstype) => {
      let userDB: User.Type | undefined = undefined;
      if (options.islogin) {
        if (req.user) {
          const profile: any = req.user;
          userDB = await MDB.get.user({ isgoogle: true, id: profile._json.sub, name: profile._json.name, picture: profile._json.picture });
        }
        // if (options.loginback && !userDB) return res.status(404).send(`
        //   <script>
        //     location.href='/login';
        //   </script>
        // `);
        if (options.loginback && !userDB) {
          if (options && options.url) res.cookie('from', '/'+options.url, {
            maxAge: 1000 * 60 * 30,
            path: '/login'
          });
          return res.redirect(`/login${(options && options.url) ? `?from=/${options.url}` : ''}`);
        }
      }
      return res.status((options.status) ? options.status : 200).render(options.index, {
        domain: this.domain,
        index: options.index,
        title: options.title,
        login: (userDB) ? true : false,
        user: {
          id: userDB?.id,
          name: userDB?.name,
          picture: userDB?.picture
        },
        url: (options.url) ? this.domain+'/'+options.url : this.domain,
        data: (options.data) ? options.data : {}
      });
    }
    this.getgoogleuser = (user: any): Profile => {
      return user;
    }
  }
}