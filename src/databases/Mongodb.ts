import { config } from "dotenv";
import { connect } from "mongoose";
import * as User from "./objs/User";
import * as Musicquiz from "./objs/Musicquiz";

config();

const mongodb_url = process.env.MONGODB_URL;
connect(mongodb_url!, (err) => {
  if (err) return console.error(err);
  console.log(`mongodb 연결 성공`);
});
const out = {
  module: {
    user: User.Model,
    musicquiz: Musicquiz.Model
  },
  get: {
    user: get_user,
    musicquiz: get_musicquiz
  }
};

export default out;

async function get_user(profile: { isgoogle: boolean, id: string, pw?: string, name?: string, picture?: string }) {
  let userDB: User.Type | null = await User.Model.findOne({ googleid: profile.id });
  if (!userDB) userDB = await User.Model.findOne({ normalid: profile.id });
  if (userDB) {
    return userDB;
  } else {
    let data = {
      normalid: (profile.isgoogle) ? '' : profile.id,
      googleid: (profile.isgoogle) ? profile.id : '',
      name: (profile.name) ? profile.name : '',
      password: (profile.pw) ? profile.pw : '',
      picture: (profile.picture) ? profile.picture : '/file/src/images/defaltuserimg.png'
    };
    const userDB: User.Type = new User.Model(data);
    await userDB.save().catch((err: any) => console.error(err));
    return userDB;
  }
}
async function get_musicquiz(room: {
  id: string,
  name: string,
  type?: string,
  limit: number,
  member?: number,
  musiccount?: number,
  private: boolean,
  password?: string
}) {
  let musicquizDB: Musicquiz.Type | null = await Musicquiz.Model.findOne({ id: room.id });
  if (musicquizDB) {
    return musicquizDB;
  } else {
    let data = {
      id: room.id,
      name: room.name,
      type: (room.name) ? room.name : 'K-POP',
      limit: room.limit,
      member: (room.member) ? room.member : 0,
      musiccount: (room.musiccount) ? room.musiccount : 10,
      private: room.private,
      password: (room.password) ? room.password : ''
    };
    const musicquizDB: Musicquiz.Type = new Musicquiz.Model(data);
    await musicquizDB.save().catch((err: any) => console.error(err));
    return musicquizDB;
  }
}