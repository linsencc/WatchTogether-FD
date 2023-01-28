import React, { useEffect, useState, useRef } from 'react';
import { Form, ButtonGroup, Button, Popover, Tag, Toast, Card, Tooltip } from '@douyinfe/semi-ui';
import { IconHome, IconClose, IconYoutube, IconUndo, IconGithubLogo, IconTick, IconAt } from '@douyinfe/semi-icons';
import { ValidateStatus } from '@douyinfe/semi-ui/lib/es/timePicker';
import { createRoom, CreateRoomRes, joinRoom, leaveRoom, Room, signOut, User } from './api';
import { updateTab, reloadTab, checkUrl0 } from './utils';


interface RoomPanelArgs {
    initUser: User,
    initRoom: Room | undefined,
    setUser: (user: User | undefined) => void
}


const RoomPanel = ({ initUser, initRoom, setUser }: RoomPanelArgs) => {
    const [room, setRoom] = useState<Room>();
    const [helpText, setHelpText] = useState<React.ReactNode>();
    const [validateStatus, setValidateStatus] = useState<ValidateStatus>('default');
    const formRef = useRef<Form<any>>(null);

    const validateRoomNumber = (val: string, values: any): any => {
        if (!val) {
            setValidateStatus('error');
            return <span>房间号不能为空</span>;
        }
        else if (val && val.length !== 4) {
            setValidateStatus('warning');
            return <span>请输入4位数房间号</span>
        } else {
            setHelpText('');
            setValidateStatus('success');
            return '';
        }
    };

    const random = () => {
        let room = (Math.random() * 10000000).toString().slice(0, 4);
        formRef.current?.formApi.setValue('roomNumber', room);
        formRef.current?.formApi.setError('roomNumber', '');
        setHelpText('');
        setValidateStatus('success');
    };

    const userSignOut = async () => {
        if (room !== undefined) {
            userLeaveRoom();
        }

        await signOut();
        setUser(undefined);
    }

    const userCreateRoom = async () => {
        let room = formRef.current?.formApi.getValue();
        let data: CreateRoomRes;

        // 检查是否为支持网站的播放页面
        if (!await checkUrl0()) {
            Toast.error({ content: '请在当前支持网站的播放页面建立房间', duration: 5 });
            return;
        }

        // todo 改为表单验证房间号
        if (room['roomNumber'] === undefined || room['roomNumber'] === '') {
            Toast.error({ content: '房间号不能为空', duration: 3 });
            return;
        } else if (room['roomNumber'].toString().length !== 4) {
            Toast.error({ content: '请输入4位数房间号', duration: 3 });
            return;
        }

        data = await createRoom(room['roomNumber']);
        if (data.code === 0 && data.data !== undefined) {
            setRoom(data.data.room);
            reloadTab();
        } else {
            console.log('userCreateRoom', data);
            Toast.error({ content: data.msg, duration: 3 });
        }
    }

    const userJoinRoom = async () => {
        let room = formRef.current?.formApi.getValue();
        let data: CreateRoomRes;

        // todo 改为表单验证
        if (room['roomNumber'] === undefined || room['roomNumber'] === '') {
            Toast.error({ content: '房间号不能为空', duration: 3 });
            return;
        } else if (room['roomNumber'].toString().length !== 4) {
            Toast.error({ content: '请输入4位数房间号', duration: 3 });
            return;
        }

        data = await joinRoom(room['roomNumber']);
        if (data.code === 0 && data.data !== undefined) {
            setRoom(data.data.room);
            updateTab(data.data.room?.room_url!);
        } else {
            console.log('userJoinRoom', data);
            Toast.error({ content: data.msg, duration: 3 });
        }
    }

    const userLeaveRoom = async () => {
        let roomNmuber = room === undefined ? '' : room.room_number;

        if (roomNmuber !== '') {
            let data: CreateRoomRes = await leaveRoom(roomNmuber);
            if (data.code === 0 && data.data !== undefined) {
                let currentUserEmail = data.data.user!.email;
                let tabId = data.data.room?.users[currentUserEmail].tab_id;
                setRoom(undefined);
                reloadTab(parseInt(tabId!));
            } else {
                console.log('userLeaveRoom', data);
                Toast.error({ content: data.msg, duration: 3 });
            }
        }
    }

    useEffect(() => {
        setRoom(initRoom);
    }, [initRoom]);


    return (
        <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex' }}>
                <div style={{
                    color: 'rgb(0 0 0 / 65%)',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    paddingLeft: '8px',
                    fontWeight: '600'
                }}> <IconYoutube /> WatchTogether
                </div>

                <div style={{ display: 'flex', color: '#adb5bd', marginLeft: 'auto', alignItems: 'end', gap: '8px' }}>
                    <div style={{ fontSize: '14px' }}>{initUser.nickname}</div>
                    <div style={{ fontSize: '12px', cursor: 'pointer' }} onClick={userSignOut}> 注销 </div>
                </div>
            </div>

            {room === undefined ?
                <div>
                    <Form
                        showValidateIcon={true}
                        ref={formRef}
                    >
                        <Form.Input
                            validate={validateRoomNumber}
                            field="roomNumber"
                            noLabel={true}
                            validateStatus={validateStatus}
                            helpText={helpText}
                            placeholder="4位数-房间号"
                        ></Form.Input>

                        <ButtonGroup size='default' style={{ display: 'flex' }}>
                            <Button style={{ flexGrow: 1 }} onClick={userCreateRoom} >创建</Button>
                            <Button style={{ flexGrow: 1 }} onClick={userJoinRoom}>加入</Button>
                        </ButtonGroup>

                        <div onClick={random} style={{
                            color: 'var(--semi-color-link)', fontSize: 14,
                            userSelect: 'none', cursor: 'pointer',
                            marginTop: '12px', paddingLeft: '4px'
                        }} >
                            没想到合适房间号？点击随机生成一个
                        </div>
                    </Form>
                </div>
                : null}

            {room !== undefined ?
                <div>
                    <Card
                        shadows='always'
                        style={{ maxWidth: 360, alignItems: 'center', margin: '12px 0 0 0', cursor: 'auto' }}
                        bodyStyle={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <IconHome style={{ color: 'var(--semi-color-primary-hover)', fontSize: '17px' }} />
                        <div style={{ fontWeight: '500', fontSize: '17px', color: 'rgb(0,0,0, 0.55)' }}>
                            {room?.room_number}
                        </div>

                        <div style={{ marginLeft: 'auto', gap: '16px', display: 'flex' }}>
                            <Tooltip content={'回到播放页面（暂未实现）'} style={{ cursor: 'pointer' }}>
                                <IconUndo />
                            </Tooltip>

                            <Tooltip content={'退出房间'} style={{ cursor: 'pointer' }}>
                                <IconClose onClick={userLeaveRoom} />
                            </Tooltip>
                        </div>
                    </Card>
                </div>
                : null}

            <div style={{
                height: '22px',
                display: 'flex',
                justifyContent: 'start',
                fontSize: '8px',
                alignItems: 'center',
                gap: '8px',
                color: 'rgb(0,0,0, 0.5)',
                padding: '14px 8px 4px 8px'
            }}>
                <div
                    style={{ display: 'flex', cursor: 'pointer' }}
                    onClick={() => window.open('https://github.com/linsencc/WatchTogether-BD')}>
                    <IconGithubLogo /> Github
                </div>

                <Popover
                    position='top'
                    content={
                        <article style={{ display: 'flex', color: 'rgb(79 81 89)', padding: 12, fontSize: '1em', gap: '4px' }}>
                            <Tag color="blue" type="light"> Bilibili </Tag>
                            <Tag color="blue" type="light"> Youtube </Tag>
                            <Tag color="blue" type="light"> Iqiyi </Tag>
                            <Tag color="blue" type="light"> AcFun </Tag>
                            <Tag color="blue" type="light"> Youku </Tag>
                        </article>
                    }>
                    <div style={{ display: 'flex', cursor: 'pointer' }}><IconTick />当前支持网站</div>
                </Popover>

                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}><IconAt size='small' /> 2023/04/23</div>
            </div >
        </div >
    );
};


export default RoomPanel;