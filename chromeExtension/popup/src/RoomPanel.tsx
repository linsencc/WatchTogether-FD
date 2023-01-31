import React, { useEffect, useState, useRef } from 'react';
import { Form, ButtonGroup, Button, Toast, Card, Tooltip, Typography } from '@douyinfe/semi-ui';
import { IconClose, IconUndo } from '@douyinfe/semi-icons';
import { ValidateStatus } from '@douyinfe/semi-ui/lib/es/timePicker';
import { createRoom, CreateRoomRes, joinRoom, leaveRoom, Room, signOut, User } from './api';
import { updateTab, reloadTab, checkUrl0 } from './utils';
import Footer from './component/RoomPanelFooter';
import Title from './component/RoomPanelTitle';
import JoinRoom from './component/RoomPanelJoinRoom';


interface RoomPanelArgs {
    initUser: User,
    initRoom: Room | undefined,
    setUser: (user: User | undefined) => void
}


const RoomPanel = ({ initUser, initRoom, setUser }: RoomPanelArgs) => {
    const [room, setRoom] = useState<Room>();
    const formRef = useRef<Form<any>>(null);
    const { Paragraph } = Typography;


    const userSignOut = async () => {
        if (room !== undefined) {
            userLeaveRoom();
        }
        await signOut();
        setUser(undefined);
    }

    const userLeaveRoom = async () => {
        let roomNmuber = room === undefined ? '' : room.room_number;

        if (roomNmuber !== '') {
            let data: CreateRoomRes = await leaveRoom(roomNmuber);
            if (data.code === 0 && data.data !== undefined) {
                let currentUserEmail = data.data.user!.email;
                let tabId = data.data.room?.users[currentUserEmail].tab_id;
                setRoom(undefined);
                reloadTab(parseInt(tabId!));
            } else {
                console.log('userLeaveRoom', data);
                Toast.error({ content: data.msg, duration: 3 });
            }
        }
    }

    useEffect(() => {
        setRoom(initRoom);
    }, [initRoom]);


    return (
        <div style={{ flexGrow: 1 }}>
            <Title user={initUser} signOut={userSignOut} />

            {room === undefined ?
                <JoinRoom setRoom={setRoom}/>
                : null}

            {room !== undefined ?
                <div>
                    <Card
                        shadows='always'
                        style={{ maxWidth: 360, alignItems: 'center', margin: '12px 0 0 0', cursor: 'auto' }}
                        bodyStyle={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >

                        <div style={{ fontWeight: '500', fontSize: '17px', color: 'rgb(0,0,0, 0.55)' }}>
                            {room?.room_number}
                        </div>
                        <Paragraph copyable={{ content: room?.room_number }} />

                        <div style={{ marginLeft: 'auto', gap: '16px', display: 'flex' }}>
                            <Tooltip content={'回到播放页面（暂未实现）'} style={{ cursor: 'pointer' }}>
                                <IconUndo />
                            </Tooltip>

                            <Tooltip content={'退出房间'} style={{ cursor: 'pointer' }}>
                                <IconClose onClick={userLeaveRoom} />
                            </Tooltip>
                        </div>
                    </Card>
                </div>
                : null}

            <Footer />

        </div >
    );
};


export default RoomPanel;