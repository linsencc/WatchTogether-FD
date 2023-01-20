import React, { useEffect, useState } from 'react';
import { Card, Tag, Avatar, List, Button } from '@douyinfe/semi-ui';
import { IconHome, IconRadio } from '@douyinfe/semi-icons';
import Draggable from 'react-draggable';
import io from 'socket.io-client';
import "../../css/content.css"


const toHHMMSS = (val) => {
    var sec_num = parseInt(val, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
}


const Content = () => {
    const [socket, setSocket] = useState(undefined);
    const [video, setVideo] = useState(undefined);

    const [roomNumber, setRoomNumber] = useState(undefined);
    const [syncId, setSyncId] = useState(undefined);

    useEffect(() => {
        setSocket(io('http://127.0.0.1:5000/room', { withCredentials: true }));
        setVideo(document.getElementsByTagName('video')[0]);
    }, []);

    return (
        <Draggable>
            <div className='content'>
                <Card
                    shadows='always'
                    style={{ width: 300, cursor: 'default' }}
                    bodyStyle={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        flexDirection: 'column'
                    }}>

                    <Listener socket={socket} video={video} roomNumber={9999}></Listener>
                    <RoomPanel socket={socket}></RoomPanel>
                </Card>
            </div>
        </Draggable>
    );
}


const Listener = ({ socket, video, roomNumber }) => {
    const [isConnected, setIsConnected] = useState(false);
    let syncEventId = undefined;

    const videoPlayEventListener = () => {
        console.log("this video on play", video.currentTime);
        socket.emit('update-user-info', { currentState: 'play', currentProgress: video.currentTime });
    }
    const videoPauseEventListener = () => {
        console.log("this video on pause", video.currentTime);
        socket.emit('update-user-info', { currentState: 'pause', currentProgress: video.currentTime });
    }
    const videoCanplayEventListener = () => {
        console.log("this video on canplay", video.currentTime);
        socket.emit('update-user-info', { currentState: 'canplay', currentProgress: video.currentTime });
    }
    const videoPlayingEventListener = () => {
        console.log("this video on playing", video.currentTime);
        socket.emit('update-user-info', { currentState: 'playing', currentProgress: video.currentTime });
    }
    const videoSeekingEventListener = () => {
        console.log("this video on seeking", video.currentTime);
        socket.emit('update-user-info', { currentState: 'seeking', currentProgress: video.currentTime });
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
        console.log("this video on Canplaythrough", video.currentTime);
        socket.emit('update-user-info', { currentState: 'Canplaythrough', currentProgress: video.currentTime });

        if (syncEventId !== undefined) {
            socket.emit('sync-event', { 'action': 'update sync state', 'state': 1 });
            syncEventId = undefined;
        }
    }
    const initNewSyncState = () => {
        socket.emit('sync-event', { 'action': 'init new sync state', 'time': video.currentTime });
        console.log('sync event emit');
    }

    useEffect(() => {
        if (socket !== undefined && video !== undefined) {
            console.log('Listener socket connect success', socket);

            socket.on('connect', () => {
                video.addEventListener('play', videoPlayEventListener);
                video.addEventListener('pause', videoPauseEventListener);
                video.addEventListener('canplay', videoCanplayEventListener);
                video.addEventListener('playing', videoPlayingEventListener);
                video.addEventListener('seeking', videoSeekingEventListener);
                video.addEventListener('seeked', videoSeekedEventListener);
                video.addEventListener('waiting', videoWaitingEventListener);
                video.addEventListener('canplaythrough', videoCanplaythroughEventListener);
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                setIsConnected(false);
                console.log('socket disconnect');
            });

            socket.on('video-action', (data) => {
                const action = data['action'];
                console.log('video-action', data);

                switch (action) {
                    case 'play':
                        video.play();
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

            return () => {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('video-action')

                video.removeEventListener('play', videoPlayEventListener);
                video.removeEventListener('pause', videoPauseEventListener);
                video.removeEventListener('canplay', videoCanplayEventListener);
                video.removeEventListener('playing', videoPlayingEventListener);
                video.removeEventListener('seeking', videoSeekingEventListener);
                video.removeEventListener('seeked', videoSeekedEventListener);
                video.removeEventListener('waiting', videoWaitingEventListener);
                video.removeEventListener('canplaythrough', videoCanplaythroughEventListener);
            };
        }
    }, [socket, video]);

    return (
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', paddingBottom: '16px', fontSize: '16px' }}>
            <div>房间号: {roomNumber}</div>

            <Tag size='small' color='green' type='solid'>{isConnected ? '在线' : '离线'}</Tag>
            <div onClick={initNewSyncState}></div>
        </div>
    )
}


const RoomPanel = ({ socket }) => {
    const [users, setUsers] = useState(undefined);

    useEffect(() => {
        if (socket !== undefined) {
            socket.on('room-panel', ({ room_number, users }) => {
                setUsers(users);
            });
            return () => {
                socket.off('room-panel');
            }
        }
    }, [socket])

    const userToList = () => {
        return Object.keys(users).map((user) => {
            return (
                <div key={user} style={{ display: 'flex', gap: '8px' }}>
                    <IconRadio /> <div style={{ width: "50px" }}>{users[user].nickname}</div>
                    <Tag color='blue' type='solid'> {toHHMMSS(users[user].video_progress)} </Tag>
                    <Tag color='green' type='solid'> {users[user].video_state} </Tag>
                </div>
            );
        });
    }

    if (users === undefined) {
        return <div>loading ...</div>
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
