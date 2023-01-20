import './App.css';
import { Layout, ButtonGroup, Button } from '@douyinfe/semi-ui';
import { useEffect, useState } from 'react';
import axios from 'axios';



axios.defaults.withCredentials = true;
const url = 'http://127.0.0.1:5000/';


interface User {
  email: string,
  nickname: string,
  socketio: boolean,
  url: string,
  video_progress: number,
  video_state: number
}


interface Room {
  room_number: string,
  users: { [key: string]: User }
}


interface UserSimple {
  email: string,
  nickname: string
}


interface Profile {
  code: number,
  msg: string,
  data: {
    room: Room,
    user: UserSimple,
  }
};


const fetchProfile = async (): Promise<Profile> => {
  const res = await axios(url + 'profile');
  console.log(res.data);
  return res.data
}


const RoomPanel = ({ room_number, users }: Room) => {
  const userList = Object.keys(users).map((email: string, index: number) =>
    <div className='roompanel user' key={index}>
      <div className='roompanel nickname'>{users[email].nickname} </div>
      <div className='roompanel progress'>{users[email].video_progress}</div>
    </div>
  );

  return (
    <div className='roompanel'>
      <div className='roompanel room-number'>{room_number}</div>
      <div className='roompanel userList'>{userList}</div>
    </div>
  );
}


const TopPanel = () => {
  const [user, setUser] = useState('---');

  const signIn = async () => {
    const param = {
      account: '123456@test.com',
      password: '123456'
    }
    const res = await axios.post(url + 'sign-in', param);
    setUser(res['data']['data']['nickname']);
    console.log(res['data']['data']['nickname']);
  }
  
  const signIn9 = async () => {
    const param = {
      account: '906478813@qq.com',
      password: '61576324'
    }
    const res = await axios.post(url + 'sign-in', param);
    setUser(res['data']['data']['nickname']);
  }
  
  const signOut = async () => {
    await axios.post(url + 'sign-out');
    setUser(' ');
  }

  return (
    <div className='TopPanel'>
      <ButtonGroup size={'default'}>
        <Button onClick={signIn}>123456 sign in</Button>
        <Button onClick={signIn9}>linsen sign in</Button>
        <Button onClick={signOut}>sign out</Button>
        <div className='TopPanel item'>{user}</div>
      </ButtonGroup>
    </div>
  );
}


function App() {
  const { Header, Footer, Content } = Layout;
  const [user, setUser] = useState<UserSimple>({ email: '', nickname: '' });
  const [room, setRoom] = useState<Room>({ room_number: '', users: {} });

  useEffect(() => {
    const fetchData = async () => {
      const data: Profile = await fetchProfile();
      setUser(data['data']['user']);
      setRoom(data['data']['room']);
    }

    // const socket = io('http://127.0.0.1:5000/room', { withCredentials: true });
    // socket.on("socket-init", (...arg) => {
    //   console.log(arg, "daf");
    // });
    // socket.emit("socket-init", { 7: Uint8Array.from([8]) });

    fetchData();
  }, []);

  return (
    <Layout className='components-layout'>
      <Header className='semi-layout-header'>
        <TopPanel/>
      </Header>
      <Content className='semi-layout-content'>
        {user !== undefined && user.nickname}
        {room !== undefined && <RoomPanel room_number={room.room_number} users={room.users} />}
      </Content>
      <Footer className='semi-layout-footer'>Footer</Footer>
    </Layout>
  );
}

export default App;
