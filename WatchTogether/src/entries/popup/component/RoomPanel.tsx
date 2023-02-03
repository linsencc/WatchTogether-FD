import { Room, User } from '../../../api';
import Footer from './RoomPanelFooter';
import Title from './RoomPanelTitle';
import JoinRoom from './RoomPanelJoinRoom';
import InRoom from './RoomPanelInRoom';


interface RoomPanelArgs {
    user: User,
    room: Room | undefined,
    setUser: (user: User | undefined) => void,
    setRoom: (room: Room | undefined) => void
}


const RoomPanel = ({ user, room, setUser, setRoom }: RoomPanelArgs) => {
    return (
        <div style={{ flexGrow: 1 }}>
            <Title user={user} setUser={setUser} room={room} setRoom={setRoom}/>
            {room === undefined ? <JoinRoom setRoom={setRoom} /> : <InRoom room={room} setRoom={setRoom} />}
            <Footer />
        </div >
    );
};


export default RoomPanel;