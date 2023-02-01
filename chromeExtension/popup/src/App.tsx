import { Skeleton } from '@douyinfe/semi-ui';
import { useEffect, useState } from 'react';
import { getProfile, User, Room } from './api';
import RoomPanel from './component/RoomPanel';
import SignIn from './component/SignInPanel';
import './App.css';


function App() {
    const [user, setUser] = useState<User>();
    const [room, setRoom] = useState<Room>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getProfile();
            setUser(data['user']);
            setRoom(data['room']);
            setLoading(false);
        }
        fetchData();
    }, []);

    const placeholder = (
        <div>
            <Skeleton.Title style={{ width: 150, marginBottom: 12, marginTop: 12 }} />
            <Skeleton.Paragraph style={{ width: 300 }} rows={4} />
        </div>
    );

    return (
        <div className='app'>
            <div className='content'>
                <Skeleton placeholder={placeholder} loading={loading} active>
                    {user === undefined ?
                        <SignIn setUser={setUser} /> :
                        <RoomPanel user={user} room={room} setUser={setUser} setRoom={setRoom} />
                    }
                </Skeleton>
            </div>
        </div>
    );
}


export default App;