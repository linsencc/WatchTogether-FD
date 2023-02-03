import { Room, User, leaveRoom, signOut } from '../../../api';
import { Toast } from '@douyinfe/semi-ui';
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
    const userSignOut = async () => {
        if (room !== undefined) {
            userLeaveRoom();
        }
        if ((await signOut()).code === 0) {
            setUser(undefined);
        }
    }

    const userLeaveRoom = async () => {
        if (room === undefined) { return };
        let roomNmuber = room.room_number;
        let leaveRoomRes = await leaveRoom(roomNmuber);

        if (leaveRoomRes.code === 0 && leaveRoomRes.data !== undefined) {
            setRoom(undefined);
            try {
                let tabId = leaveRoomRes.data.user!.tab_id!;
                await chrome.tabs.update(Number(tabId), { url: leaveRoomRes.data.room?.room_url! });
            } catch (error) {
                console.log('tab id not found', error);
            }
        } else {
            Toast.error({ content: leaveRoomRes.msg, duration: 3 });
        }
    }

    return (
        <div style={{ flexGrow: 1 }}>
            <Title user={user} userSignOut={userSignOut} />
            {room === undefined ? <JoinRoom setRoom={setRoom} /> : <InRoom room={room} userLeaveRoom={userLeaveRoom} />}
            <Footer />
        </div >
    );
};


export default RoomPanel;