import axios from 'axios';
import { getHostname } from './utils';


axios.defaults.withCredentials = true;
const hostname = getHostname();


const getProfile = async () => {
    let user = {};
    await axios.post(hostname + '/profile', {})
        .then((res) => {
            user = res.data.data;
        })
        .catch((res) => {
            console.log(res);
        })
    return user;
}


export { hostname, getProfile}

