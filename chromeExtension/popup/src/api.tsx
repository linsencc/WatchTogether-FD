import axios from 'axios';


axios.defaults.withCredentials = true;
const hostName = 'https://119.91.150.116:5000';



const getProfile = async () => {
    let user = {};

    await axios.post(hostName + '/profile', {})
        .then((res) => {
            user = res.data.data;
        })
        .catch((res) => {
            console.log(res);
        })

    return user;
}


const signIn = async (arg: SignInSubmit) => {
    let signInRes: SignInRes = { code: -1, msg: '', data: { user: { 'nickname': '', email: '' } } }
    let postData = { account: arg['account'], password: arg['password'] };

    await axios.post(hostName + '/sign-in', postData)
        .then((res) => {
            signInRes = res.data;
            return signInRes;
        })
        .catch((res) => {
            signInRes = res.response.data;
            return signInRes
        })

    return signInRes
}


const signUp = async (arg: SignInSubmit) => {
    let signInRes: SignInRes = { code: -1, msg: '', data: { user: { 'nickname': '', email: '' } } }
    let postData = { account: arg['account'], password: arg['password'], nickname: arg['nickname'] };

    await axios.post(hostName + '/sign-up', postData)
        .then((res) => {
            signInRes = res.data;
            return signInRes;
        })
        .catch((res) => {
            signInRes = res.response.data;
            return signInRes
        })
    return signInRes
}


// 后端注销的response cookie由于未携带sanmeSite标识，在开发阶段会触发浏览器的CORS不处理cookie 导致登出失败
// 在部署到chrome extension时，由于在mainfest.json中申明了服务器IP权限，则不会出现该问题
const signOut = async () => {
    let signInRes: SignInRes = { code: -1, msg: '', data: {} }
    await axios.post(hostName + '/sign-out')
        .then((res) => {
            signInRes = res.data;
            return signInRes;
        })
        .catch((res) => {
            signInRes = res.response.data;
            return signInRes
        })

    return signInRes;
}


const createRoom = async (room: number) => {
    let data: CreateRoomRes = { code: -1, msg: 'init', data: {} };

    await axios.post(hostName + '/create-room', room)
        .then((res) => {
            data = res['data'];
        })
        .catch((res) => {
            console.log(res);
        })

    return data;
}


const joinRoom = async (room: number) => {
    let data: CreateRoomRes = { code: -1, msg: 'init', data: {} };

    await axios.post(hostName + '/join-room', room)
        .then((res) => {
            data = res['data'];
        })
        .catch((res) => {
            console.log(res);
        })

    return data;
}


const leaveRoom = async (roomNumber: string) => {
    let data: CreateRoomRes = { code: -1, msg: 'init', data: {} };

    await axios.post(hostName + '/leave-room', { roomNumber: roomNumber })
        .then((res) => {
            data = res['data'];
        })
        .catch((res) => {
            console.log(res);
        })

    return data;
}

export interface CreateRoomRes {
    code: number,
    msg: string,
    data: {
        room?: Room,
    }
}


export interface User {
    email: string,
    nickname: string,
    socketio?: string,
    url?: string,
    video_progress?: string,
    video_state?: string
}

export interface Room {
    room_number: string,
    [props: string]: User | string
}

export interface Profile {
    user?: User,
    room?: Room
}

export interface SignInArgs {
    setUser: (user: User) => void
}

export interface SignInSubmit {
    account: string,
    password: string,
    nickname?: string,
}

export interface SignInRes {
    code: number,
    msg: string,
    data: {
        user?: User
    }
}

export { hostName, getProfile, signIn, signUp, signOut, createRoom, joinRoom, leaveRoom }