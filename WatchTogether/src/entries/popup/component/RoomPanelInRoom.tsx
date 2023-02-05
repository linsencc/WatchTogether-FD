import { Card, Tooltip, Typography, Toast } from '@douyinfe/semi-ui';
import { IconClose, IconUndo } from '@douyinfe/semi-icons';
import { getCurrentTab, getRoomTab } from '../../../utils';
import { Room } from '../../../api';


interface InRoomArgs {
    room: Room,
    userLeaveRoom: () => void
}


const InRoom = ({ room, userLeaveRoom }: InRoomArgs) => {
    const { Text } = Typography;

    const backRoomTab = async () => {
        let roomTab = await getRoomTab();
        let currentTab = await getCurrentTab();

        if (roomTab !== undefined) {
            if (roomTab.id !== currentTab.id) {
                chrome.tabs.highlight({ tabs: roomTab.index, windowId: roomTab.windowId });
            } else {
                Toast.info({ content: "当前已在房间页面😉", duration: 3 });
            }
        }
    }

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
                    <Tooltip content={'回到房间页面'} style={{ cursor: 'pointer' }}>
                        <IconUndo onClick={backRoomTab} />
                    </Tooltip>
                    <Tooltip content={'退出房间'} style={{ cursor: 'pointer' }}>
                        <IconClose onClick={userLeaveRoom} />
                    </Tooltip>
                </div>
            </Card>
        </div>
    )
}


export default InRoom