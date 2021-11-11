import http from "http";
import https from "https";
import * as socket_io from "socket.io";
import MDB from "../databases/Mongodb";
import { getroom, room_on } from "./room";

export default async function socketio(server: http.Server | https.Server | undefined) {
  if (!server) return console.error('socket error: 서버를 찾을수 없습니다.');
  console.log('socket server: 서버 시작');

  /** socket 통신 */
  const io = new socket_io.Server(server);
  const io_room = io.of('/room');

  /** getroom */
  setInterval(async () => getroom(io), 3000);
  /** room_on */
  room_on(io_room);
  
  /** io_on */
  io.on('connection', async (socket) => {
    var name: string;
    var userid: string;
    var roomid: string;
    socket.on('login', async (data) => {
      console.log(`client login: ${data.name}`);
      name = data.name;
      userid = data.userid;
      roomid = data.roomid;
    });
    socket.on('getroom', async () => {
      // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
      // socket.broadcast.emit('chat', msg);
  
      // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
      socket.emit('getroom', await getroom(io));
  
      // 접속된 모든 클라이언트에게 메시지를 전송한다
      // io.emit('chat', room);
  
      // 특정 클라이언트에게만 메시지를 전송한다
      // io.to(userid).emit('getroom', room);
    });
    socket.on('forceDisconnect', async () => {
      socket.disconnect();
    });
    socket.on('disconnect', async () => {
      if (name) {
        console.log(`client disconnect: ${name}`);
      }
      if (roomid !== '') {
        let roomDB = await MDB.module.musicquiz.findOne({ id: roomid });
        if (roomDB) {
          roomDB.member = roomDB.member - 1;
          roomDB.save().catch(err => console.error(err));
        }
      }
    });
  });
}