import { IconYoutube } from '@douyinfe/semi-icons';
import { User } from '../../../api';


interface RoomPanelTitleArgs {
    user: User,
    userSignOut: () => {}
}


const Title = ({ user, userSignOut }: RoomPanelTitleArgs) => {
    const logoCss = {
        color: 'rgb(0 0 0 / 65%)',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '600'
    }

    const userCss = {
        display: 'flex',
        color: '#adb5bd',
        marginLeft: 'auto',
        alignItems: 'end',
        gap: '8px',
        fontSize: '12px'
    }

    return (
        <div style={{ display: 'flex', margin: '0 8px' }}>
            <div style={logoCss}>
                <IconYoutube /> WatchTogether
            </div>

            <div style={userCss}>
                <div style={{ fontSize: '14px' }}>{user.nickname}</div>
                <div style={{ cursor: 'pointer' }} onClick={userSignOut}> 注销 </div>
            </div>
        </div >
    )
}


export default Title