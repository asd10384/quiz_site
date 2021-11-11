import * as socket_io from "socket.io";
import MDB from "../databases/Mongodb";

console.log('socket server: room 서버 확인');
var room = { roomlist: '' };

export async function getroom(io: socket_io.Server) {
  let roomlist = await MDB.module.musicquiz.find();
  room.roomlist = '';
  roomlist.forEach(async (r, index) => {
    if (r.member <= 0) {
      await MDB.module.musicquiz.deleteOne({ id: r.id, name: r.name });
    } else {
      room.roomlist += `<a class="room" href="#" onclick="joinroom(this, ${r.private});">
<div class="line"></div>
<p class="id">${r.id}</p>
<p class="play"><ion-icon name="ellipse"></ion-icon></p>
<p class="name">${r.name}</p>
<p class="type">${r.type}</p>
<p class="member">${r.member}/${r.limit}</p>
<p class="round">라운드 ${r.musiccount}</p>
<p class="lock"><ion-icon name="lock-${(r.private) ? 'closed' : 'open'}"></ion-icon></p>
</a>
`;
    }
  });
  io.emit('getroom', room);
  return room;
}

export async function room_on(io_room: socket_io.Namespace) {
  io_room.on('connection', async (socket) => {
    var name: string;
    var userid: string;
    var picture: string;
    var roomid: string;
    socket.on('login', async (data) => {
      console.log(`room login: ${data.name}`);
      name = data.name;
      userid = data.userid;
      picture = data.picture;
      roomid = data.roomid;
      if (data.roomid) {
        let room = await MDB.module.musicquiz.findOne({ id: roomid });
        if (room) {
          room.member = room.member + 1;
          room.members.push({ name: name, id: userid, picture: picture });
          await room.save().catch(err => console.error(err));
          socket.join(roomid);
          io_room.to(roomid).emit('members', room.members);
        }
      }
    });
    socket.on('disconnect', async () => {
      if (name) {
        console.log(`room disconnect: ${name}`);
      }
      if (roomid !== '') {
        let roomDB = await MDB.module.musicquiz.findOne({ id: roomid });
        if (roomDB) {
          socket.leave(roomid);
          roomDB.member = roomDB.member - 1;
          let memberlist: any[] = [];
          roomDB.members.forEach((member) => {
            if (member.id !== userid) memberlist.push(member);
          });
          roomDB.members = memberlist;
          await roomDB.save().catch(err => console.error(err));
          io_room.to(roomid).emit('members', roomDB.members);
        }
      }
    });
  });
}