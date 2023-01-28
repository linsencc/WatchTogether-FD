
## 目的
- 在同一个房间下，各个用户之间可以相互交换信息
- 同步用户间的播放进度
- 点击按钮之后，双方显示loading蒙版，loading完成后自动播放
- 不在房间、不在页面 则不可被同步

## 房间状态
- 第一个用户建立房间，并加入房间
- 所有用户退出房间，房间自动删除
- 用户输入房间号，加入房间
- 用户点击按钮，退出房间

## 用户状态
- 用户是否在当前页面
- 当前页面的视频是否处于播放就绪状态




生成 Chrome Extension content.js
1. 进入WatchTogether-FD/content目录下，命令行执行下面命令，使用babel监听文件夹，进行react转码；
//  npx babel --watch src/js/original --out-dir src/js/babel --presets @babel/preset-react

2. 同样在WatchTogether-FD/content目录下，命令行执行下面命令，使用webpack监听文件夹进行打包；
//  npx webpack --mode development