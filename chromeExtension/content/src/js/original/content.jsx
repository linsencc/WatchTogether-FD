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

    const { Text } = Typography;
    let onSync = false;

    function videoPauseEvent(e) {
        console.log("this video on pause", video.currentTime);
        socket.emit('updateUserInfo', { currentState: 'pause', currentProgress: video.currentTime });
    }
    const videoPlayingEvent = () => {
        console.log("this video on playing", video.currentTime);
        socket.emit('updateUserInfo', { currentState: 'playing', currentProgress: video.currentTime });
    }
    const videoSeekedEvent = () => {
        console.log("this video on seeked", video.currentTime);
        socket.emit('updateUserInfo', { currentState: 'seeked', currentProgress: video.currentTime });
    }
    const videoWaitingEvent = () => {
        console.log("this video on waiting", video.currentTime);
        socket.emit('updateUserInfo', { currentState: 'waiting', currentProgress: video.currentTime });
    }
    const videoCanplaythroughEvent = () => {
        if (onSync) {
            socket.emit('sync', { 'action': 'updateState', 'state': 1 });
            onSync = false;  // socketVideoPause中标识一个sync事件开始
        }
    }
    const socketVideoPause = (data) => {
        onSync = true;
        video.pause();
        video.currentTime = data['time'];
    }
    const socketVideoPlay = (data) => {
        video.play();
    }
    const launchSync = () => {
        socket.emit('sync', { 'action': 'init', 'time': video.currentTime });
    }
    const lanuchPause = () => {
        socket.emit('sync', { 'action': 'pause', 'time': video.currentTime });
    }

    useEffect(() => {
        const initData = async () => {
            console.log('[WT] init room, video, socket');
            let data = await getProfile();

            // 检测用户登录、房间状态
            if (data['user'] !== undefined && data['room'] !== undefined) {
                let currentUserEmail = data['user']['email'];
                let currentTabIdBD = data['room']['users'][currentUserEmail]['tab_id'];
                let currentTabIdFD = (await getCurrentTab())['tabId'];

                // 检测当前tab与建立或加入房间时tab是否相匹配
                if (currentTabIdBD === currentTabIdFD) {
                    setRoom(data['room']['room_number']);
                    setSocket(io(hostname + '/room', { withCredentials: true }));
                    setVideo(document.getElementsByTagName('video')[0]);
                    setShowPanel(true);
                }
            }
        }
        initData();
    }, []);

    useEffect(() => {
        if (video !== undefined && socket !== undefined && room !== undefined) {
            socket.on('connect', () => {
                video.addEventListener('pause', videoPauseEvent);
                video.addEventListener('playing', videoPlayingEvent);
                video.addEventListener('seeked', videoSeekedEvent);
                video.addEventListener('waiting', videoWaitingEvent);
                video.addEventListener('canplaythrough', videoCanplaythroughEvent);
                observer.observe(video, { 'attributeFilter': ['src', 'duration'] });
            });

            socket.on('videoAction', (data) => {
                if (data['action'] === 'play') {
                    socketVideoPlay(data);
                } else if (data['action'] === 'pause') {
                    socketVideoPause(data);
                } else if (data['action'] === 'updateUrl') {
                    window.location.replace(data['url']);
                }
            });

            // 使用MutationObserver监听video.src变化，实现用户视频切换同步
            var observer = new MutationObserver((records) => {
                if (video.src !== '' && video.src !== undefined) {
                    socket.emit('sync', { 'action': 'updateUrl', 'url': window.location.href });
                }
            });
            // 定时更新用户信息
            const intervalUpdateState = setInterval(() => {
                socket.emit('updateUserInfo', { currentProgress: video.currentTime });
            }, 200);

            // 初始化视频播放状态，避免出现在socket建立时视频已经开始播放，状态显示'init'不更新情况
            const videoInitState = video.paused ? 'pause' : 'playing';
            socket.emit('updateUserInfo', { currentState: videoInitState, currentProgress: video.currentTime });

            return () => {
                video.removeEventListener('pause', videoPauseEvent);
                video.removeEventListener('playing', videoPlayingEvent);
                video.removeEventListener('seeked', videoSeekedEvent);
                video.removeEventListener('waiting', videoWaitingEvent);
                video.removeEventListener('canplaythrough', videoCanplaythroughEvent);
                observer.disconnect();
                socket.close();
                clearInterval(intervalUpdateState);
            }
        }
    }, [socket, video, room]);

    if (showPanel === false) {
        return null;
    }

    return (
        <Draggable>
            <div style={{ position: 'fixed', bottom: '40px', right: ' 20px', zIndex: 1000 }}>
                <Card shadows='always' style={{ width: 300, cursor: 'default' }}
                    bodyStyle={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}>

                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', paddingBottom: '6px', fontSize: '16px' }}>
                        {room !== undefined
                            ? <Text copyable={{ content: room }}>房间号: {room} </Text>
                            : <Skeleton.Paragraph style={{ width: 60 }} rows={1} />}
                    </div>
                    <RoomPanel socket={socket}></RoomPanel>

                    <div style={{ width: 'auto', marginTop: '12px' }}>
                        <Button theme='solid' onClick={launchSync} block> 同步进度  </Button>
                    </div>
                </Card>
            </div>
        </Draggable>
    )
}


const RoomPanel = ({ socket }) => {
    const [users, setUsers] = useState(undefined);
    const { Text } = Typography;

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
