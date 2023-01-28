import React, { useEffect, useState } from 'react';
import { Card, Tag, List, Skeleton, Button, Typography } from '@douyinfe/semi-ui';
import { IconBolt } from '@douyinfe/semi-icons';
import Draggable from 'react-draggable';
import io from 'socket.io-client';

import { getCurrentTab, toHHMMSS } from './utils';
import { getProfile, hostname } from './api';


const Content = () => {
    const [socket, setSocket] = useState(undefined);
    const [video, setVideo] = useState(undefined);
    const [room, setRoom] = useState(undefined);
    const [showPanel, setShowPanel] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const { Text } = Typography;

    let syncEventId = undefined;

    const videoPauseEventListener = () => {
        console.log("this video on pause", video.currentTime);
        socket.emit('update-user-info', { currentState: 'pause', currentProgress: video.currentTime });
    }
    const videoPlayingEventListener = () => {
        console.log("this video on playing", video.currentTime);
        socket.emit('update-user-info', { currentState: 'playing', currentProgress: video.currentTime });
    }
    const videoSeekedEventListener = () => {
        console.log("this video on seeked", video.currentTime);
        socket.emit('update-user-info', { currentState: 'seeked', currentProgress: video.currentTime });
    }
    const videoWaitingEventListener = () => {
        console.log("this video on waiting", video.currentTime);
        socket.emit('update-user-info', { currentState: 'waiting', currentProgress: video.currentTime });
    }
    const videoCanplaythroughEventListener = () => {
        // 防止出现循环调用
        if (syncEventId !== undefined) {
            socket.emit('sync-event', { 'action': 'update sync state', 'state': 1, 'syncEventId': syncEventId });
        }
    }
    const setVideoListener = () => {
        // video.addEventListener('play', videoPlayEventListener);
        video.addEventListener('pause', videoPauseEventListener);
        video.addEventListener('playing', videoPlayingEventListener);
        video.addEventListener('seeked', videoSeekedEventListener);
        video.addEventListener('waiting', videoWaitingEventListener);
        video.addEventListener('canplaythrough', videoCanplaythroughEventListener);
    }
    const removeVideoListener = () => {
        // video.removeEventListener('play', videoPlayEventListener);
        video.removeEventListener('pause', videoPauseEventListener);
        video.removeEventListener('playing', videoPlayingEventListener);
        video.removeEventListener('seeked', videoSeekedEventListener);
        video.removeEventListener('waiting', videoWaitingEventListener);
        video.removeEventListener('canplaythrough', videoCanplaythroughEventListener);
    }
    const setNewSyncEvent = () => {
        socket.emit('sync-event', { 'action': 'init new sync state', 'time': video.currentTime });
    }

    useEffect(() => {
        console.log('loading content');
        const fetchProfileData = async () => {
            let data = await getProfile();

            // 用户登录并且在房间内
            if (data['user'] !== undefined && data['room'] !== undefined) {
                let currentUserEmail = data['user']['email'];
                let currentTabIdBD = data['room']['users'][currentUserEmail]['tab_id'];
                let currentTabIdFD = (await getCurrentTab())['tabId'];

                // 当前的tab与建立或加入房间时tab相匹配
                if (currentTabIdBD === currentTabIdFD) {
                    console.log('set room, video, socket');
                    setRoom(data['room']['room_number']);
                    setSocket(io(hostname + '/room', { withCredentials: true }));
                    setVideo(document.getElementsByTagName('video')[0]);
                    setShowPanel(true);
                }
            }
        }
        fetchProfileData();
    }, []);

    useEffect(() => {
        if (video !== undefined && socket !== undefined && room !== undefined) {
            console.log('set listener on');

            socket.on('connect', () => {
                setVideoListener();
                setIsConnected(true);
                console.log('socket connect');
            });

            socket.on('disconnect', () => {
                setIsConnected(false);
                console.log('socket disconnect');
            });

            socket.on('video-action', (data) => {
                const action = data['action'];
                switch (action) {
                    case 'play':
                        video.play();
                        syncEventId = undefined;
                        break;
                    case 'pause-and-jump':
                        video.pause();
                        video.currentTime = data['time'];
                        syncEventId = data['sync-event-id'];
                        break;
                    default:
                        console.log('mistake action');
                }
            });

            const intervalUpdateState = setInterval(() => {
                socket.emit('update-user-info', { currentProgress: video.currentTime });
            }, 200);


            // 初始化视频播放状态，避免出现在socket建立时视频已经开始播放，video init不更新情况
            const videoInitState = video.paused ? 'pause' : 'playing';
            socket.emit('update-user-info', { currentState: videoInitState, currentProgress: video.currentTime });

            return () => {
                removeVideoListener();
                clearInterval(intervalUpdateState);
                socket.off('connect');
                socket.off('disconnect');
                socket.off('video-action');
                console.log('set listener off');
            }
        }
    }, [socket, video, room]);

    if (showPanel) {
        return (
            <Draggable>
                <div style={{ position: 'fixed', bottom: '40px', right: ' 20px', }}>
                    <Card
                        shadows='always'
                        style={{ width: 300, cursor: 'default' }}
                        bodyStyle={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            flexDirection: 'column'
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', paddingBottom: '6px', fontSize: '16px' }}>
                            {room !== undefined ?
                                <Text copyable={{ content: room }}>房间号: {room} </Text> :
                                <Skeleton.Paragraph style={{ width: 60 }} rows={1} />
                            }
                        </div>

                        <RoomPanel socket={socket}></RoomPanel>

                        <div style={{ width: 'auto', marginTop: '12px' }}>
                            <Button
                                theme='solid'
                                onClick={setNewSyncEvent}
                                block>
                                同步进度
                            </Button>
                        </div>
                    </Card>
                </div>
            </Draggable>
        )
    } else {
        return null;
    }
}


const RoomPanel = ({ socket }) => {
    const [users, setUsers] = useState(undefined);
    const { Text } = Typography;

    useEffect(() => {
        console.log('socket', socket);

        if (socket !== undefined) {
            socket.on('room-panel', ({ users }) => {
                setUsers(users);
            });
            return () => {
                socket.off('room-panel');
            }
        }
    }, [socket])

    const stateToColor = (state) => {
        if (state == 'playing' || state == 'play') return 'green';
        if (state == 'pause') return 'orange';
        if (state == 'waiting' || state == 'init') return 'white';
        if (state == 'close') return 'red';
        return 'red';
    }

    const socketioToColor = (socketio) => {
        if (socketio == true) return "#505050";
        else return "#f4f4f4";
    }

    const userToList = () => {
        return Object.keys(users).map((user) => {
            const stateColor = stateToColor(users[user].video_state);
            const socketioColor = socketioToColor(users[user].socketio);

            return (
                <div key={user} style={{ display: 'flex', gap: '8px' }}>
                    <IconBolt style={{ color: socketioColor }} />
                    <Text
                        ellipsis={{ showTooltip: { opts: { content: users[user].nickname } } }}
                        style={{ width: 56 }}>{users[user].nickname}</Text>
                    <Tag color='blue' type='solid'> {toHHMMSS(users[user].video_progress)} </Tag>
                    <Tag color={stateColor} type='solid'> {users[user].video_state} </Tag>
                </div>
            );
        });
    }

    if (users === undefined) {
        return (
            <Skeleton.Paragraph style={{ width: 240 }} rows={3} />
        )
    } else {
        return (
            <List
                dataSource={userToList()}
                renderItem={item => <List.Item style={{ padding: "12px 24px 4px 0px" }}>{item}</List.Item>}
            />
        )
    }
}


export default Content
