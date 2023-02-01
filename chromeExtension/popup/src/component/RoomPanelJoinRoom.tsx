import { Form, ButtonGroup, Button, Toast } from '@douyinfe/semi-ui';
import { useState, useRef } from 'react';
import { ValidateStatus } from '@douyinfe/semi-ui/lib/es/timePicker';
import { createRoom, joinRoom, Room } from '../api';
import { checkUrl } from '../utils';


interface JoinRoomArgs {
    setRoom: (room: Room) => void
}


const JoinRoom = ({ setRoom }: JoinRoomArgs) => {
    const [validateStatus, setValidateStatus] = useState<ValidateStatus>('default');
    const formRef = useRef<Form<any>>(null);

    const getRandomRoomNumber = () => {
        let room = (Math.random() * 10000000).toString().slice(0, 4);
        formRef.current?.formApi.setValue('roomNumber', room);
        formRef.current?.formApi.setError('roomNumber', '');
        setValidateStatus('success');
    };

    const validateRoomNumber = (val: string, values: any): any => {
        if (!val) {
            setValidateStatus('error');
            return <span>房间号不能为空</span>;
        }
        else if (val.length !== 4) {
            setValidateStatus('warning');
            return <span>请输入4位数房间号</span>
        } else {
            setValidateStatus('success');
            return '';
        }
    };

    const userCreateRoom = async () => {
        if (!await checkUrl()) {
            Toast.error({ content: '请在当前支持网站的播放页面建立房间', duration: 5 });
            return;
        }

        if (validateStatus === 'success') {
            let formValue = formRef.current?.formApi.getValue();
            let createRoomRes = await createRoom(formValue['roomNumber']);

            if (createRoomRes.code === 0 && createRoomRes.data !== undefined && createRoomRes.data.room !== undefined) {
                setRoom(createRoomRes.data.room);
                chrome.tabs.update({ url: createRoomRes.data.room?.room_url! });
            } else {
                Toast.error({ content: createRoomRes.msg, duration: 3 });
            }
        }
    }

    const userJoinRoom = async () => {
        if (validateStatus === 'success') {
            let formValue = formRef.current?.formApi.getValue();
            let createRoomRes = await joinRoom(formValue['roomNumber']);

            if (createRoomRes.code === 0 && createRoomRes.data !== undefined && createRoomRes.data.room !== undefined) {
                setRoom(createRoomRes.data.room);
                let tabId = createRoomRes.data.user?.tab_id!;
                chrome.tabs.update(Number(tabId), { url: createRoomRes.data.room?.room_url! });
            } else {
                Toast.error({ content: createRoomRes.msg, duration: 3 });
            }
        }
    }

    return (
        <div>
            <Form showValidateIcon={true} ref={formRef}>
                <Form.Input
                    validate={validateRoomNumber}
                    field="roomNumber"
                    noLabel={true}
                    validateStatus={validateStatus}
                    placeholder="4位数-房间号"
                ></Form.Input>

                <ButtonGroup size='default' style={{ display: 'flex' }}>
                    <Button style={{ flexGrow: 1 }} onClick={userCreateRoom} >创建</Button>
                    <Button style={{ flexGrow: 1 }} onClick={userJoinRoom}>加入</Button>
                </ButtonGroup>

                <div onClick={getRandomRoomNumber} style={{
                    color: 'var(--semi-color-link)', fontSize: 14,
                    userSelect: 'none', cursor: 'pointer',
                    marginTop: '12px', paddingLeft: '4px'
                }} >
                    没想到合适房间号？点击随机生成一个
                </div>
            </Form>
        </div>
    )
}


export default JoinRoom