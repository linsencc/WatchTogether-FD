import { useEffect, useState } from 'react';
import { Card, Skeleton, Button, Typography } from '@douyinfe/semi-ui';
import Draggable from 'react-draggable';
import io, { Socket } from 'socket.io-client';
import { getCurrentTabIdByBackground } from '../../utils';
import { getProfile, hostname, Profile, Room } from '../../api';
import UsersPanel from './component/UsersPanel'


interface VideoActionArgs {
    action: string,
    time?: number,
    type?: string,
    url?: string
}


const Content = () => {
    const [socket, setSocket] = useState<Socket>();
    const [video, setVideo] = useState<HTMLVideoElement>();
    const [room, setRoom] = useState<Room>();
    const [showPanel, setShowPanel] = useState<boolean>(false);

    const { Text } = Typography;
    let onSync = false;

    function videoPauseEvent(e: Event) {
        console.log("this video on pause", video!.currentTime);
        socket!.emit('updateInfo', { currentState: 'pause', currentProgress: video!.currentTime });
    }
    const videoPlayingEvent = () => {
        console.log("this video on playing", video!.currentTime);
        socket!.emit('updateInfo', { currentState: 'playing', currentProgress: video!.currentTime });
    }
    const videoSeekedEvent = () => {
        console.log("this video on seeked", video!.currentTime);
        socket!.emit('updateInfo', { currentState: 'seeked', currentProgress: video!.currentTime });
    }
    const videoWaitingEvent = () => {
        console.log("this video on waiting", video!.currentTime);
        socket!.emit('updateInfo', { currentState: 'waiting', currentProgress: video!.currentTime });
    }
    const videoCanplaythroughEvent = () => {
        if (onSync) {
            socket!.emit('sync', { 'action': 'updateState', 'state': 1 });
            onSync = false;  // socketVideoPause中标识一个sync事件开始
        }
    }
    const socketVideoPause = (videoTime: number) => {
        onSync = true;
        video!.pause();
        video!.currentTime = videoTime;
    }
    const socketVideoPlay = () => {
        video!.play();
    }
    const launchSync = () => {
        socket!.emit('sync', { 'action': 'init', 'time': video!.currentTime });
    }
    // const lanuchPause = () => {
    //     socket!.emit('sync', { 'action': 'pause', 'time': video!.currentTime });
    // }

    useEffect(() => {
        const initData = async () => {
            console.log('[WT] init room, video, socket');
            let data: Profile = await getProfile();
            console.log('[WT] profile', data);

            // 检测用户登录、房间状态
            if (data['user'] !== undefined && data['room'] !== undefined) {
                let currentTabIdBD = data['user']['tab_id'];
                let currentTabIdFD = await getCurrentTabIdByBackground();

                // 检测当前tab与建立或加入房间时tab是否相匹配
                if (currentTabIdBD === currentTabIdFD) {
                    setRoom(data.room);
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
                observer.observe(video, { 'attributeFilter': ['src'] });
                launchSync();
            });

            socket.on('videoAction', (data: VideoActionArgs) => {
                if (data['action'] === 'play') {
                    socketVideoPlay();
                } else if (data['action'] === 'pause') {
                    socketVideoPause(data.time!);
                } else if (data['action'] === 'updateUrl') {
                    window.location.replace(data.url!);
                }
            });

            // 通过地址栏输入url打开新页面时同步
            const currentVideoIdentify = document.title + video.duration.toString();
            if (room.video_identify === '') {
                socket.emit('updateInfo', { videoIdentify: currentVideoIdentify });
            } else if (room.video_identify !== currentVideoIdentify) {
                socket.emit('updateInfo', { videoIdentify: currentVideoIdentify });
                socket.emit('sync', { 'action': 'updateUrl', 'url': window.location.href });
            }

            // 使用MutationObserver监听video.src变化，实现用户视频切换同步
            var observer = new MutationObserver((records) => {
                if (video.src !== '' && video.src !== undefined) {
                    socket.emit('updateInfo', { videoIdentify: currentVideoIdentify });
                    socket.emit('sync', { 'action': 'updateUrl', 'url': window.location.href });
                }
            });
            // 定时更新用户信息
            const intervalUpdateState = setInterval(() => {
                socket.emit('updateInfo', { currentProgress: video.currentTime });
            }, 100);

            // 初始化视频播放状态，避免出现在socket建立时视频已经开始播放，状态显示'init'不更新情况
            const videoInitState = video.paused ? 'pause' : 'playing';
            socket.emit('updateInfo', { currentState: videoInitState, currentProgress: video.currentTime });

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

                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', paddingBottom: '6px' }}>
                        {room !== undefined
                            ? <div>
                                <div style={{ fontSize: '16px', display: 'inline' }}>房间号: {room.room_number}</div>
                                <Text copyable={{ content: room.room_number }}> </Text>
                            </div>
                            : <Skeleton.Paragraph style={{ width: 60 }} rows={1} />}
                    </div>
                    <UsersPanel socket={socket}></UsersPanel>

                    <div style={{ width: 'auto', marginTop: '12px' }}>
                        <Button theme='solid' onClick={launchSync} block> 同步进度  </Button>
                    </div>
                </Card>
            </div>
        </Draggable>
    )
}


export default Content
