import { Button, Form, Toast } from '@douyinfe/semi-ui';
import { useState } from 'react';
import { signIn, signUp, SignInApiArgs, User } from '../../../api';
import { verifyEmail } from '../../../utils';


export interface SignInArgs {
    setUser: (user: User) => void
}


const SignIn = ({ setUser }: SignInArgs) => {
    const [type, setType] = useState<string>('sign-in');

    const handlerSubmit = async (values: SignInApiArgs) => {
        let signInRes = (type === 'sign-in') ? await signIn(values) : await signUp(values);;
        if (signInRes.code === 0 && signInRes.data.user !== undefined) {
            setUser(signInRes.data.user);
        } else {
            Toast.error({ content: signInRes.msg, duration: 3 });
        }
    }

    return (
        <div>
            <div style={{ marginBottom: "0px" }}>
                <Button onClick={() => { setType('sign-in') }} size='default' style={{ marginRight: '12px', fontSize: '16px', background: 'white' }}> 用户登录</Button>
                <Button onClick={() => { setType('sign-up') }} size='default' style={{ marginRight: '12px', fontSize: '16px', background: 'white' }}> 用户注册</Button>
            </div>

            <Form onSubmit={values => handlerSubmit(values)}>
                <Form.Input
                    labelPosition='left' maxLength={32} field='account'
                    label='🍺用户：' placeholder='输入用于登录的邮箱' showClear
                    rules={[
                        { required: true, message: 'required error' },
                        { validator: (rule, value) => verifyEmail(value), message: 'Email verification failed' }
                    ]}
                    style={{ width: 200 }} />
                <Form.Input
                    labelPosition='left' maxLength={32} field='password'
                    label='🥝密码：' placeholder='请输入用户密码' showClear mode="password"
                    rules={[{ required: true, message: 'Please input password' }]}
                    style={{ width: 200 }} />
                {type === 'sign-up' ? (
                    <Form.Input
                        labelPosition='left' maxLength={16} field='nickname'
                        label='🍰昵称：' placeholder='输入用于展示的昵称' showClear
                        rules={[{ required: true, message: 'Please input nickname' }]}
                        style={{ width: 200 }} />
                ) : null}

                <div style={{ marginTop: '4px', marginBottom: '12px' }}>
                    <Button type="primary" htmlType="submit" block>
                        {type === 'sign-in' ? '登录' : '注册'}
                    </Button>
                </div>
            </Form>
        </div>
    );
}


export default SignIn