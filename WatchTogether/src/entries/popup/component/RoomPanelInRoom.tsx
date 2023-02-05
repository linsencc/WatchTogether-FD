import { Toast, Card, Tooltip, Typography } from '@douyinfe/semi-ui';
import { IconClose } from '@douyinfe/semi-icons';
import { Room } from '../../../api';


interface InRoomArgs {
    room: Room,
    userLeaveRoom: () => void
}


const InRoom = ({ room, userLeaveRoom }: InRoomArgs) => {
    const { Text } = Typography;

    return (
        <div>
            <Card
                style={{ maxWidth: 360, alignItems: 'center', margin: '12px 0 0 0', cursor: 'auto' }}
                shadows='always' bodyStyle={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

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