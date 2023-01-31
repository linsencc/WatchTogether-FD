import { Skeleton, Typography } from '@douyinfe/semi-ui';
import { useEffect, useState } from 'react';

import './App.css';
import { getProfile } from './api';
import { User, Room, Profile, SignInSubmit, SignInArgs, SignInRes } from './api'
import RoomPanel from './RoomPanel';
import SignIn from './component/SignInPanel';


function App() {
    const [user, setUser] = useState<User>();
    const [room, setRoom] = useState<Room>();
    const [loading, setLoading] = useState<boolean>(true);

    const setUserInChildComponent = (user: User | undefined): void => {
        setUser(user);
    }

    useEffect(() => {
        const fetchData = async () => {
            const data: Profile = await getProfile();
            console.log('profile: ', data);
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
                        <SignIn setUser={setUserInChildComponent} /> :
                        <RoomPanel initUser={user} initRoom={room} setUser={setUserInChildComponent} />
                    }
                </Skeleton>
            </div>
        </div>
    );
}


export default App;