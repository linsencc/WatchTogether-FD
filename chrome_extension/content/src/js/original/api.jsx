import axios from 'axios';


axios.defaults.withCredentials = true;
const hostName = 'http://127.0.0.1:5000';


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

export { hostName, getProfile}