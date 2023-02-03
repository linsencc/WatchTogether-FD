import { Tag, List, Skeleton, Typography } from '@douyinfe/semi-ui';
import { toHHMMSS } from '../../../utils';
import { IconBolt } from '@douyinfe/semi-icons';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Users } from '../../../api';


interface UsersPanelArgs {
    socket: Socket | undefined
}


const UsersPanel = ({ socket }: UsersPanelArgs) => {
    const [users, setUsers] = useState<Users>({});
    const { Text } = Typography;

    useEffect(() => {
        if (socket !== undefined) {
            socket.on('room-panel', ({ users }) => { setUsers(users) });
            return () => { socket.off('room-panel') }
        }
    }, [socket])

    const stateToColor = (state: string) => {
        if (state === 'playing' || state === 'play') return 'green';
        if (state === 'pause') return 'orange';
        if (state === 'waiting' || state === 'init') return 'white';
        if (state === 'close') return 'red';
        return 'red';
    }

    const socketioToColor = (socketio: boolean) => {
        if (socketio === true) return "#505050";
        else return "#f4f4f4";
    }

    const userToList = () => {
        return Object.keys(users).map((user) => {
            const stateColor = stateToColor(users[user].video_state!);
            const socketioColor = socketioToColor(users[user].socketio!);

            return (
                <div key={user} style={{ display: 'flex', gap: '8px' }}>
                    <IconBolt style={{ color: socketioColor }} />
                    <Text
                        ellipsis={{ showTooltip: { opts: { content: users[user].nickname } } }}
                        style={{ width: 56 }}>{users[user].nickname}</Text>
                    <Tag color='blue' type='solid'> {toHHMMSS(users[user].video_progress!)} </Tag>
                    <Tag color={stateColor} type='solid'> {users[user].video_state} </Tag>
                </div>
            );
        });
    }

    return (users === undefined
        ? <Skeleton.Paragraph style={{ width: 240 }} rows={3} />
        : <List dataSource={userToList()} renderItem={item => <List.Item style={{ padding: "12px 24px 4px 0px" }}>{item}</List.Item>} />
    )
}


export default UsersPanel