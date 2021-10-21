import { config } from "dotenv";
import { join } from "path";

config();

export default class Consts {
  /** Router 폴더 경로 */
  public static readonly ROUTERS_PATH = join(__dirname, 'router');
  /** Router 파일 경로 계산 */
  public static readonly ROUTER_PATH = (routerFile: string) => join(this.ROUTERS_PATH, routerFile);
}