let hostUrl = 'http://127.0.0.1:5000/';
let loadingDom = $('.container.loading');
let signInDom = $('.container.sign-in');
let contentDom = $('.container.content');


$('#test').click(async () => {
    // let url = hostUrl + 'profile';
    // $.post(url, function(data,status){
    //     console.log(JSON.stringify(data));
    //     console.log(JSON.stringify(status));
    // });


    // let roomId = $("#room-id-input").val();

    // let [tabs] = await chrome.tabs.query({active: true, currentWindow: true});

    // let message = {
    //     action: 'createRoom',
    //     data: {
    //         roomId: roomId,
    //     }
    // }


    // chrome.tabs.sendMessage(tabs.id, message, res => {
    //     console.log('popup=>content')
    //     console.log(res)
    // })


    // chrome.cookies.getAll({
    //     url: 'http://127.0.0.1/'
    //   }, (cookies) => {
    //     console.log('cookie', cookies)
    //   })

    let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)remember_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    console.log(cookieValue);

    $.post("http://127.0.0.1:5000/test", function(res){
        console.log('res', res);
    });


    //
    //  let hostUrl = 'http://127.0.0.1:5000/dcenter';
    //
    //  socket = io.connect(hostUrl);
    //  let x = socket.emit('my_event', {data: "popup tests"});

    // console.log(socket);
    // console.log(x);
});


chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    sendResponse('我收到了你的来信')
    console.log('接收了来自 content.js的消息', req.info)
})


// Start Utils ----------------------------------------------------------
// 用户未登录则显示登录页面
document.addEventListener('DOMContentLoaded', async () => {
    console.log('popup DOMContentLoaded done');
    let url = hostUrl + 'profile';

    $.post(url, function (data, status) {
        if (status === 'success' && data['code'] === 0) {
            showDom('content');
            renderContent(data);
        } else {
            showDom('signIn');
        }
    });
});

function setPageCloseModal(text, time) {
    let delay = time;
    let interval = setInterval(function () {
        let modalText = String(text) + ", " + Number(delay / 1000) + "s 后关闭提示";
        $("#login-modal .modal-title").text(modalText);
        if (delay == time) {
            $("#login-modal").modal("show");
        }
        if (delay <= 0) {
            clearInterval(interval);
            $("#login-modal").modal("hide");
        }
        delay -= 1000;
    }, 1000);
}


function renderContent(data) {
    let nickname = data['data']['user']['nickname'];
    // alert(JSON.stringify(data['data']));
    $('.container.content .profile .user-name').text(nickname);
}


function showDom(name) {
    loadingDom.css('display', 'none');
    contentDom.css('display', 'none');
    signInDom.css('display', 'none');

    if (name === 'loading') loadingDom.css('display', 'flex');
    if (name === 'content') contentDom.css('display', 'flex');
    if (name === 'signIn') signInDom.css('display', 'flex');
}

// End Utils ---------------------------------------------------------------


// Start 内容页面 ---------------------------------------------------------------------
// 用户注销
$('#sign-out').click(() => {
    let url = hostUrl + 'sign-out';
    $.post(url, function (data, status) {
        if (status === 'success' && data['code'] === 0) {
            showDom('signIn')
        }
    });
})
// End 内容页面-----------------------------------------------------------------------


// Start 用户登录页面 ------------------------------------------------------------------
$(".login-sign-in").click(function () {
    $(".login-sign-in").css("border-bottom", "3px #056de8 solid");
    $(".login-sign-up").css("border-bottom", "hidden");
    $(".login-item.nike-name").css({"height": "0", "visibility": "hidden"});
    $(".login-button").text("登录");
    $(".login-button").attr("action", "sign-in");
});

$(".login-sign-up").click(function () {
    $(".login-sign-up").css("border-bottom", "3px #056de8 solid");
    $(".login-sign-in").css("border-bottom", "hidden");
    $(".login-item.nike-name").css({"height": "44px", "visibility": "visible"});
    $(".login-button").text("注册");
    $(".login-button").attr("action", "sign-up");
});

$(".login-button").click(function () {
    let action = $(".login-button").attr("action")
    if (action == "sign-in") signIn();
    if (action == "sign-up") signUp();
});

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
} 


function signIn() {
    $("#login-modal .modal-title").text("正在登录...");
    $("#login-modal").modal("show");

    // 构建登录数据
    let postData = {
        "account": $("#email").val(),
        "password": $("#password").val(),
    }

    $.ajax({
        url: hostUrl + 'sign-in',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        xhrFields: {
            withCredentials: true
        },
        data: JSON.stringify(postData),
        crossDomain: true,
        success: function (data, status, xhr) {
            let msg = data["msg"];
            setPageCloseModal(msg, 3000);
            showDom('content');
            
            // let headers = xhr.getAllResponseHeaders();
            // var cookietoSet=xhr.getResponseHeader('Set-Cookie');
            let cookietoSet = getCookie('Set-Cookie');
            console.log('header:', cookietoSet);
            console.log(document.cookie);
        },
        error: function (res) {
            let msg = res.responseJSON["msg"];
            setPageCloseModal(msg, 3000);
        }
    });
};

function signUp() {
    $("#login-modal .modal-title").text("正在注册...");
    $("#login-modal").modal("show");

    // 构建注册数据
    let postData = {
        "nickname": $("#nickname").val(),
        "account": $("#email").val(),
        "password": $("#password").val(),
    }

    $.ajax({
        url: hostUrl + 'sign-up',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(postData),
        success: function (res) {
            let msg = res["msg"];
            setPageCloseModal(msg, 3000);
        },
        error: function (res) {
            let msg = res.responseJSON["msg"];
            setPageCloseModal(msg, 3000);
        }
    });
}

// End 用户登录页面 -------------------------------------------------------


