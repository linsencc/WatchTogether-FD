import axios from 'axios';
import { getCurrentTab, getHostname } from './utils';


axios.defaults.withCredentials = true;
const hostname = getHostname();


export interface User {
    email: string,
    nickname: string,
    socketio?: boolean,
    url?: string,
    tab_id?: string,
    video_progress?: string,
    video_state?: string
}

export interface Users {
    [email: string]: User
}

export interface Room {
    room_number: string,
    room_url: string,
    video_identify: string,
    users: {
        [props: string]: User
    }
}

export interface Profile {
    user?: User,
    room?: Room
}


const getProfile = async () => {
    let profile: Profile = {};
    await axios.post(hostname + '/profile', {})
        .then((res) => { profile = res.data.data; })
        .catch((res) => { console.log(res); })
    return profile;
}

export interface SignInApiArgs {
    account: string,
    password: string,
    nickname?: string,
}

export interface SignInaApiRes {
    code: number,
    msg: string,
    data: { user?: User }
}

const signIn = async (arg: SignInApiArgs) => {
    let signInRes: SignInaApiRes = { code: -1, msg: '', data: { user: { 'nickname': '', email: '' } } }
    let postData = { account: arg['account'], password: arg['password'] };

    await axios.post(hostname + '/sign-in', postData).then((res) => {
        signInRes = res.data;
        return signInRes;
    }).catch((res) => {
        signInRes = res.response.data;
        return signInRes
    })
    return signInRes
}


const signUp = async (arg: SignInApiArgs) => {
    let signInRes: SignInaApiRes = { code: -1, msg: '', data: { user: { 'nickname': '', email: '' } } }
    let postData = { account: arg['account'], password: arg['password'], nickname: arg['nickname'] };

    await axios.post(hostname + '/sign-up', postData).then((res) => {
        signInRes = res.data;
        return signInRes;
    }).catch((res) => {
        signInRes = res.response.data;
        return signInRes
    })
    return signInRes
}


// 后端注销的response cookie由于未携带sanmeSite标识，在开发阶段会触发浏览器的CORS不处理cookie 导致登出失败
// 在部署到chrome extension时，由于在mainfest.json中申明了服务器IP权限，则不会出现该问题
const signOut = async () => {
    let signInRes: SignInaApiRes = { code: -1, msg: '', data: {} }

    await axios.post(hostname + '/sign-out').then((res) => {
        signInRes = res.data;
        return signInRes;
    }).catch((res) => {
        signInRes = res.response.data;
        return signInRes
    })
    return signInRes;
}


export interface CreateRoomRes {
    code: number,
    msg: string,
    data: {
        room?: Room,
        user?: User
    }
}

const createRoom = async (room: number) => {
    let data: CreateRoomRes = { code: -1, msg: 'init', data: {} };
    let tabData = await getCurrentTab();
    let postData = { roomNumber: room, tabId: tabData.id, roomUrl: tabData.url }

    await axios.post(hostname + '/create-room', postData).then((res) => {
        data = res['data'];
        chrome.storage.local.set({ room: { tabId: tabData.id, roomNumber: room } });
    }).catch((res) => {
        console.log(res);
    })
    return data;
}


const joinRoom = async (room: number) => {
    let data: CreateRoomRes = { code: -1, msg: 'init', data: {} };
    let tabData = await getCurrentTab();
    let postData = { roomNumber: room, tabId: tabData.id }

    await axios.post(hostname + '/join-room', postData).then((res) => {
        data = res['data'];
        chrome.storage.local.set({ room: { tabId: tabData.id, roomNumber: room } });
    }).catch((res) => {
        console.log(res);
    })
    return data;
}


const leaveRoom = async (roomNumber: string) => {
    let data: CreateRoomRes = { code: -1, msg: 'init', data: {} };

    await axios.post(hostname + '/leave-room', { roomNumber: roomNumber }).then((res) => {
        data = res['data'];
        chrome.storage.local.remove('room');
    }).catch((res) => {
        console.log(res);
    })
    return data;
}


const leaveRoomFetch = async (roomNumber: string) => {
    const options = {
        method: "POST",
        headers: { 'Content-Type': 'application/json', credentials: 'include' },
        body: JSON.stringify({ roomNumber: roomNumber }),
    };

    let response = await fetch(hostname + '/leave-room', options);
    let data: CreateRoomRes = await response.json();
    chrome.storage.local.remove('room');
    return data;
}


export { hostname, getProfile, signIn, signUp, signOut, createRoom, joinRoom, leaveRoom, leaveRoomFetch }