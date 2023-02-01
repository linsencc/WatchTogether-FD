import { Toast, Card, Tooltip, Typography } from '@douyinfe/semi-ui';
import { IconClose } from '@douyinfe/semi-icons';
import { leaveRoom, Room } from '../api';


interface InRoomArgs {
    room: Room,
    setRoom: (room: Room | undefined) => void
}


const InRoom = ({ room, setRoom }: InRoomArgs) => {
    const { Text } = Typography;

    const userLeaveRoom = async () => {
        let roomNmuber = room.room_number;
        let leaveRoomRes = await leaveRoom(roomNmuber);

        if (leaveRoomRes.code === 0 && leaveRoomRes.data !== undefined) {
            setRoom(undefined);
            try{
                let tabId = leaveRoomRes.data.user!.tab_id!;
                chrome.tabs.update(Number(tabId), { url: leaveRoomRes.data.room?.room_url! });
            }catch{
                console.log('tab id not found');
            }
        } else {
            Toast.error({ content: leaveRoomRes.msg, duration: 3 });
        }
    }

    return (
        <div>
            <Card
                shadows='always'
                style={{ maxWidth: 360, alignItems: 'center', margin: '12px 0 0 0', cursor: 'auto' }}
                bodyStyle={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >

                <div style={{ fontWeight: '500', fontSize: '17px', color: 'rgb(0,0,0, 0.55)' }}>
                    {room?.room_number}
                </div>
                <Text copyable={{ content: room?.room_number }} > </Text>

                <div style={{ marginLeft: 'auto', gap: '16px', display: 'flex' }}>
                    <Tooltip content={'退出房间'} style={{ cursor: 'pointer' }}>
                        <IconClose onClick={userLeaveRoom} />
                    </Tooltip>
                </div>
            </Card>
        </div>
    )
}


export default InRoom