import React, { useEffect, useState } from 'react';
import { Card, Tag, List, Skeleton, Button } from '@douyinfe/semi-ui';
import { IconRadio, IconBolt } from '@douyinfe/semi-icons';
import Draggable from 'react-draggable';
import io from 'socket.io-client';

import { toHHMMSS } from './utils';
import { getProfile, hostName } from './api';


const Content = () => {
    const [socket, setSocket] = useState(undefined);
    const [video, setVideo] = useState(undefined);
    const [room, setRoom] = useState(undefined);
    const [isConnected, setIsConnected] = useState(false);
    let syncEventId = undefined;

    // const videoPlayEventListener = () => {
    //     console.log("this video on play", video.currentTime);
    //     socket.emit('update-user-info', { currentState: 'play', currentProgress: video.currentTime });
    // }
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
        const fetchProfileData = async () => {
            let data = await getProfile();
            if (data['user'] !== undefined && data['room'] !== undefined) {
                console.log('set room, video, socket');
                setRoom(data['room']['room_number']);
                setSocket(io(hostName + '/room', { withCredentials: true }));
                setVideo(document.getElementsByTagName('video')[0]);
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
            }, 100);

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

    return (
        <Draggable>
            <div style={{ position: 'fixed',bottom: '40px', right: ' 20px', zIndex: 9999 }}>
                <Card
                    shadows='always'
                    style={{ width: 300, cursor: 'default' }}
                    bodyStyle={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        flexDirection: 'column'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', paddingBottom: '12px', fontSize: '16px' }}>
                        <div>房间号: {room}</div>
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
        </Draggable >
    );
}


const RoomPanel = ({ socket }) => {
    const [users, setUsers] = useState(undefined);

    useEffect(() => {
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
        if (state == 'waiting') return 'white';
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
                    <div style={{ width: "50px" }}>{users[user].nickname}</div>
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
