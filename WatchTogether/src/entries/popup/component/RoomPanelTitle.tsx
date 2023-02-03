import { IconYoutube } from '@douyinfe/semi-icons';
import { Toast } from '@douyinfe/semi-ui';
import { Room, User, signOut, leaveRoom } from '../../../api';


interface RoomPanelTitleArgs {
    user: User,
    room: Room | undefined,
    setUser: (user: User | undefined) => void,
    setRoom: (room: Room | undefined) => void
}


const Title = ({ user, setUser, room, setRoom }: RoomPanelTitleArgs) => {
    const logoCss = {
        color: 'rgb(0 0 0 / 65%)',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '600'
    }

    const userCss = {
        display: 'flex',
        color: '#adb5bd',
        marginLeft: 'auto',
        alignItems: 'end',
        gap: '8px',
        fontSize: '12px'
    }

    const userLeaveRoom = async () => {
        let roomNmuber = room!.room_number;
        let leaveRoomRes = await leaveRoom(roomNmuber);

        if (leaveRoomRes.code === 0 && leaveRoomRes.data !== undefined) {
            setRoom(undefined);

            try {
                let tabId = leaveRoomRes.data.user!.tab_id;
                await chrome.tabs.update(parseInt(tabId!), { url: leaveRoomRes.data.room?.room_url! });
            } catch (error) {
                console.log('tab id not found', error);
            }
        } else {
            Toast.error({ content: leaveRoomRes.msg, duration: 3 });
        }
    }

    const userSignOut = async () => {
        if (room !== undefined) {
            userLeaveRoom();
        }
        if ((await signOut()).code === 0) {
            setUser(undefined);
        }
    }

    return (
        <div style={{ display: 'flex', margin: '0 8px' }}>
            <div style={logoCss}>
                <IconYoutube /> WatchTogether
            </div>

            <div style={userCss}>
                <div style={{ fontSize: '14px' }}>{user.nickname}</div>
                <div style={{ cursor: 'pointer' }} onClick={userSignOut}> 注销 </div>
            </div>
        </div >
    )
}


export default Title