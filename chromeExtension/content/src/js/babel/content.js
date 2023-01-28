import React, { useEffect, useState } from 'react';
import { Card, Tag, List, Skeleton, Button, Popover, Toast } from '@douyinfe/semi-ui';
import { IconBolt } from '@douyinfe/semi-icons';
import Draggable from 'react-draggable';
import io from 'socket.io-client';
import { getCurrentTab, toHHMMSS } from './utils';
import { getProfile, hostName } from './api';
const Content = () => {
  const [socket, setSocket] = useState(undefined);
  const [video, setVideo] = useState(undefined);
  const [room, setRoom] = useState(undefined);
  const [showPanel, setShowPanel] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  let syncEventId = undefined;
  const videoPauseEventListener = () => {
    console.log("this video on pause", video.currentTime);
    socket.emit('update-user-info', {
      currentState: 'pause',
      currentProgress: video.currentTime
    });
  };
  const videoPlayingEventListener = () => {
    console.log("this video on playing", video.currentTime);
    socket.emit('update-user-info', {
      currentState: 'playing',
      currentProgress: video.currentTime
    });
  };
  const videoSeekedEventListener = () => {
    console.log("this video on seeked", video.currentTime);
    socket.emit('update-user-info', {
      currentState: 'seeked',
      currentProgress: video.currentTime
    });
  };
  const videoWaitingEventListener = () => {
    console.log("this video on waiting", video.currentTime);
    socket.emit('update-user-info', {
      currentState: 'waiting',
      currentProgress: video.currentTime
    });
  };
  const videoCanplaythroughEventListener = () => {
    // 防止出现循环调用
    if (syncEventId !== undefined) {
      socket.emit('sync-event', {
        'action': 'update sync state',
        'state': 1,
        'syncEventId': syncEventId
      });
    }
  };
  const setVideoListener = () => {
    // video.addEventListener('play', videoPlayEventListener);
    video.addEventListener('pause', videoPauseEventListener);
    video.addEventListener('playing', videoPlayingEventListener);
    video.addEventListener('seeked', videoSeekedEventListener);
    video.addEventListener('waiting', videoWaitingEventListener);
    video.addEventListener('canplaythrough', videoCanplaythroughEventListener);
  };
  const removeVideoListener = () => {
    // video.removeEventListener('play', videoPlayEventListener);
    video.removeEventListener('pause', videoPauseEventListener);
    video.removeEventListener('playing', videoPlayingEventListener);
    video.removeEventListener('seeked', videoSeekedEventListener);
    video.removeEventListener('waiting', videoWaitingEventListener);
    video.removeEventListener('canplaythrough', videoCanplaythroughEventListener);
  };
  const setNewSyncEvent = () => {
    socket.emit('sync-event', {
      'action': 'init new sync state',
      'time': video.currentTime
    });
  };
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
          setSocket(io(hostName + '/room', {
            withCredentials: true
          }));
          setVideo(document.getElementsByTagName('video')[0]);
          setShowPanel(true);
        }
      }
    };
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
      socket.on('video-action', data => {
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
        socket.emit('update-user-info', {
          currentProgress: video.currentTime
        });
      }, 200);

      // 初始化视频播放状态，避免出现在socket建立时视频已经开始播放，video init不更新情况
      const videoInitState = video.paused ? 'pause' : 'playing';
      socket.emit('update-user-info', {
        currentState: videoInitState,
        currentProgress: video.currentTime
      });
      return () => {
        removeVideoListener();
        clearInterval(intervalUpdateState);
        socket.off('connect');
        socket.off('disconnect');
        socket.off('video-action');
        console.log('set listener off');
      };
    }
  }, [socket, video, room]);
  if (showPanel) {
    return /*#__PURE__*/React.createElement(Draggable, null, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        bottom: '40px',
        right: ' 20px',
        zIndex: 9999
      }
    }, /*#__PURE__*/React.createElement(Card, {
      shadows: "always",
      style: {
        width: 300,
        cursor: 'default'
      },
      bodyStyle: {
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '8px',
        paddingBottom: '6px',
        fontSize: '16px'
      }
    }, room !== undefined ? /*#__PURE__*/React.createElement("div", null, "\u623F\u95F4\u53F7: ", room) : /*#__PURE__*/React.createElement(Skeleton.Paragraph, {
      style: {
        width: 60
      },
      rows: 1
    })), /*#__PURE__*/React.createElement(RoomPanel, {
      socket: socket
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 'auto',
        marginTop: '12px'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      theme: "solid",
      onClick: setNewSyncEvent,
      block: true
    }, "\u540C\u6B65\u8FDB\u5EA6")))));
  } else {
    return null;
  }
};
const RoomPanel = ({
  socket
}) => {
  const [users, setUsers] = useState(undefined);
  useEffect(() => {
    if (socket !== undefined) {
      socket.on('room-panel', ({
        users
      }) => {
        setUsers(users);
      });
      return () => {
        socket.off('room-panel');
      };
    }
  }, [socket]);
  const stateToColor = state => {
    if (state == 'playing' || state == 'play') return 'green';
    if (state == 'pause') return 'orange';
    if (state == 'waiting' || state == 'init') return 'white';
    if (state == 'close') return 'red';
    return 'red';
  };
  const socketioToColor = socketio => {
    if (socketio == true) return "#505050";else return "#f4f4f4";
  };
  const userToList = () => {
    return Object.keys(users).map(user => {
      const stateColor = stateToColor(users[user].video_state);
      const socketioColor = socketioToColor(users[user].socketio);
      return /*#__PURE__*/React.createElement("div", {
        key: user,
        style: {
          display: 'flex',
          gap: '8px'
        }
      }, /*#__PURE__*/React.createElement(IconBolt, {
        style: {
          color: socketioColor
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          width: "50px"
        }
      }, users[user].nickname), /*#__PURE__*/React.createElement(Tag, {
        color: "blue",
        type: "solid"
      }, " ", toHHMMSS(users[user].video_progress), " "), /*#__PURE__*/React.createElement(Tag, {
        color: stateColor,
        type: "solid"
      }, " ", users[user].video_state, " "));
    });
  };
  if (users === undefined) {
    return /*#__PURE__*/React.createElement(Skeleton.Paragraph, {
      style: {
        width: 240
      },
      rows: 3
    });
  } else {
    return /*#__PURE__*/React.createElement(List, {
      dataSource: userToList(),
      renderItem: item => /*#__PURE__*/React.createElement(List.Item, {
        style: {
          padding: "12px 24px 4px 0px"
        }
      }, item)
    });
  }
};
export default Content;