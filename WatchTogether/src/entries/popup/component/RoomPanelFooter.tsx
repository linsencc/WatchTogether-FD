import { Popover, Tag } from '@douyinfe/semi-ui';
import { IconGithubLogo, IconTick, IconAt } from '@douyinfe/semi-icons';


const Footer = () => {
    return (
        <div style={{
            height: '22px', display: 'flex', fontSize: '8px',
            alignItems: 'center', gap: '8px', color: 'rgb(0,0,0, 0.5)', padding: '14px 8px 4px 8px'
        }}>
            {/* github 链接 */}
            <div style={{ display: 'flex', cursor: 'pointer' }}
                onClick={() => window.open('https://github.com/linsencc/WatchTogether-BD')}>
                <IconGithubLogo /> Github
            </div>

            {/* 支持网站提示 */}
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

            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <IconAt size='small' /> 2023/04/23
            </div>
        </div >
    )
}


export default Footer