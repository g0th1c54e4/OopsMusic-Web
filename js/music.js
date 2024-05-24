let timeline_param = 15;
/*
时间轴响应周期时间(毫秒)。理论上此值为1的话,时间轴的时间定位将最为精确,但实际上在HTML5规定
中,已经规定setInterval函数的周期最短是10毫秒,因此实际上无法把周期时间设置为比10毫秒
更短的时间.
*/
const circle_len = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--len').slice(0, -2)) / 100;
let volumn = -0.5; //音量
let theme_color; //适应主题色
const default_theme_color = "radial-gradient(circle, rgba(238,95,176,1) 0%, rgba(112,80,254,1) 100%)"; //默认主题色
let played = false;
let start_msg = anime({
    targets: document.getElementById("msgBox"),
    duration: 5000,
    easing: "linear",
    loop: false,
    autoplay: false,
    opacity:[
        { value: 0.75, duration: 300},
        { value: 1, duration: 2000},
        { value: 0.4, duration: 150},
        { value: 0, duration: 150}
    ]
});

msg(0, "Welcome!");

let shining_str = 0.6; //闪耀强度(0 ~ 1)
let flicker_light;
function shining(bpm, beat, loopSign){
    flicker_light = anime({
        targets: [document.getElementById("light_left"), document.getElementById("light_right")],
        duration: (60000 / bpm),
        endDelay: ((60000 / bpm) * (beat - 1)),
        easing: "linear",
        loop: loopSign,
        autoplay: false,
        keyframes: [
            {opacity: 1.0 * shining_str},
            {opacity: 0.9 * shining_str},
            {opacity: 0.75 * shining_str},
            {opacity: 0.5 * shining_str},
            {opacity: 0.25 * shining_str},
            {opacity: 0.15 * shining_str},
            {opacity: 0},
          ]
    });
    flicker_light.restart();
}
let flicker_light_kiai_left;
let flicker_light_kiai_right;
let flicker_light_kiai_ball;
function shining_kiai(bpm, loopSign){
    flicker_light_kiai_left = anime({
        targets: document.getElementById("light_left"),
        duration: (60000 / bpm),
        endDelay: (60000 / bpm),
        easing: "linear",
        loop: loopSign,
        autoplay: false,
        keyframes: [
            {opacity: 1.0},
            {opacity: 0.9},
            {opacity: 0.75},
            {opacity: 0.5},
            {opacity: 0.25},
            {opacity: 0.15},
            {opacity: 0},
          ]
    });
    flicker_light_kiai_right = anime({
        targets: document.getElementById("light_right"),
        duration: (60000 / bpm),
        delay: (60000 / bpm),
        easing: "linear",
        loop: loopSign,
        autoplay: false,
        keyframes: [
            {opacity: 1.0},
            {opacity: 0.9},
            {opacity: 0.75},
            {opacity: 0.5},
            {opacity: 0.25},
            {opacity: 0.15},
            {opacity: 0},
          ]
    });
    flicker_light_kiai_ball = anime({
        targets: document.getElementById("light_ball"),
        duration: (60000 / bpm),
        delay: (60000 / bpm),
        easing: "linear",
        loop: loopSign,
        autoplay: false,
        keyframes: [
            {opacity: 1.0},
            {opacity: 0.9},
            {opacity: 0.75},
            {opacity: 0.5},
            {opacity: 0.25},
            {opacity: 0.15},
            {opacity: 0},
          ]
    });
    flicker_light_kiai_left.restart();
    flicker_light_kiai_right.restart();
    flicker_light_kiai_ball.restart();
}

let flicker_light_screen;
function shining_screen(bpm){
    flicker_light_screen = anime({
        targets: document.getElementById("light_screen"),
        duration: (60000 / bpm),
        easing: "linear",
        loop: false,
        autoplay: false,
        keyframes: [
            {opacity: 1.0},
            {opacity: 0.9},
            {opacity: 0.75},
            {opacity: 0.5},
            {opacity: 0.4},
            {opacity: 0.25},
            {opacity: 0.15},
            {opacity: 0},
        ]
    });
    flicker_light_screen.restart();
}

let parallax_sign = true; //是否开启视差特效
document.addEventListener('mousemove', parallax);
function parallax(e) {
    this.querySelectorAll('.layer').forEach(layer => {
        if (parallax_sign == false){
            return;
        }

        const speed = layer.getAttribute('data-speed')

        const winWidth = document.documentElement.clientWidth;
        const winHeight = document.documentElement.clientHeight;

        const x = (winWidth - (e.pageX) * speed) / 1000;
        const y = (winHeight - (e.pageY) * speed) / 1000;

        layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
})
}

function theme_color_get(image, imageWidth, imageHeight){ //主题色提取算法
    let result = default_theme_color; //default value
    try{
        let canvas = document.createElement('canvas');
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        let canvas_ctx = canvas.getContext("2d");
        canvas_ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        let data = canvas_ctx.getImageData(0, 0, imageWidth, imageHeight).data;

        let r = 1, g = 1, b = 1;
        for (let row = 0; row < image.height; row++) {
            for (var col = 0; col < imageWidth; col++) {
                if(row == 0){
                    r += data[((imageWidth * row) + col)];
                    g += data[((imageWidth * row) + col) + 1];
                    b += data[((imageWidth * row) + col) + 2];
                }else{
                    r += data[((imageWidth * row) + col) * 4];
                    g += data[((imageWidth * row) + col) * 4 + 1];
                    b += data[((imageWidth * row) + col) * 4 + 2];
                }
            }
        }

        r /= (imageWidth * imageHeight);
        g /= (imageWidth * imageHeight);
        b /= (imageWidth * imageHeight);

        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);

        result = `rgb(${r}, ${g}, ${b})`;

    }catch(e){
        console.log("[!]无法使用自动主题色功能, OopsMusic将使用默认主题色。");
    }

    return result;
}

function updateBackgroundImage(){
    const winWidth = document.documentElement.clientWidth;
    const winHeight = document.documentElement.clientHeight;
    let bg = document.getElementById("main_background");
    let scale_value = 0;
    let parallax_scale = 0.05; //固定补偿值
    let imageWidth = parseInt(bg.getAttribute("ImageWidth"));
    let imageHeight = parseInt(bg.getAttribute("ImageHeight"));

    if (imageWidth < winWidth){ //低分辨率照片在高分辨率屏幕上
        scale_value = ((winWidth + 10) / imageWidth) + parallax_scale; 
        bg.style.width = parseInt(imageWidth * scale_value) + "px";
        bg.style.height = parseInt(imageHeight * scale_value) + "px";
        bg.style.left = parseInt(((imageWidth * scale_value) - winWidth) / -2) + "px";
        bg.style.top = parseInt(((imageHeight * scale_value) - winHeight) / -2) + "px";

    }else{ //高分辨率在低分辨率屏幕上
        scale_value = 1 + parallax_scale;
        bg.style.width = parseInt(imageWidth * scale_value) + "px";
        bg.style.height = parseInt(imageHeight * scale_value) + "px";
        bg.style.left = parseInt(((imageWidth * scale_value) - winWidth) / -2) + "px";
        bg.style.top = parseInt(((imageHeight * scale_value) - winHeight) / -2) + "px";

        scale_value = (winWidth + 10) / imageWidth + parallax_scale;
    }

    if ((imageHeight * scale_value) < winHeight){ 
        //宽屏状态下若宽度过小，使背景图高度不能正常填充，则用此高度调整分支来缓解背景图显示。
        scale_value += (winHeight - (imageHeight * scale_value)) / winHeight;
    }
    
    bg.style.scale = scale_value;
}

function setBackgroundImage(filePath){
    let image = new Image();
    image.src = filePath;
    image.onload = function(){
        let imageWidth = image.naturalWidth;
        let imageHeight = image.naturalHeight;

        theme_color = theme_color_get(image, imageWidth, imageHeight); //主题色
        document.getElementById("beatCube").style.background = theme_color;

        let bg = document.getElementById("main_background");
        document.body.style.background = "black";

        bg.style.backgroundImage = 'url(' + filePath + ')';
        bg.setAttribute("ImageWidth", imageWidth);
        bg.setAttribute("ImageHeight", imageHeight);

        updateBackgroundImage();
    }
    image.onerror = function(){
        msg(2, "背景图加载失败");
    }
}

function setDefaultBackgroundImage(){
    var max = 25;
    var min = 1;
    random_number = Math.floor(Math.random() * (max - min + 1)) + min;
    let filePath = "./img/background/background"  + random_number + ".jpg"; //random background
    setBackgroundImage(filePath);
}
setDefaultBackgroundImage();

// let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioCtx = new window.AudioContext();
let audioBufferSourceNode = null;
let analyser = audioCtx.createAnalyser();

analyser.fftSize = 2048; //快速傅立叶变换范围 默认2048

let gainNode;
let loopFlag = false; //单曲循环 标志
const rootElement = document.documentElement;
let loadFile = function (files) {
    play(files[0]);
}

let oopsJson;
let global_bpm = 0;
let global_Beat = 0;
let global_KiaiTime = false;
let kiai_beatstage_offset = 0; // kiai时间下的可视化圆环的补偿值 (0为无补偿)
let update_song_process_timer;
let global_buffer;
let quick_index = 0; //时间轴快速索引
function base64ToBinary(base64) {
    const binaryString = atob(base64);
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

let play = function (file) {
    let fr = new FileReader();
    fr.onload = function (e) {
        const decoder = new TextDecoder('utf-8');
        const oopsJsonText = decoder.decode(e.target.result);
        
        try{
            oopsJson = JSON.parse(oopsJsonText);
        }catch(e){
            msg(2, "读取谱面失败")
            return;
        }
        let tempSongText = oopsJson.FileBuffer;
        let songData;
        try{
            songData = base64ToBinary(tempSongText);
        }catch(e){
            msg(2, "谱面歌曲数据已损坏")
            return;
        }

        try{
            audioCtx.decodeAudioData(songData).then(function (buffer) {
                global_buffer = buffer;
                if (audioBufferSourceNode != null) {
                    audioBufferSourceNode.stop();
                }
                audioBufferSourceNode = null;
                audioBufferSourceNode = audioCtx.createBufferSource();
                audioBufferSourceNode.buffer = buffer;
                audioBufferSourceNode.connect(audioCtx.destination);
                audioBufferSourceNode.connect(analyser);
                audioBufferSourceNode.loop = false; //循环播放
    
                gainNode = audioCtx.createGain();
                audioBufferSourceNode.connect(gainNode);
                gainNode.connect(audioCtx.destination);
    
                gainNode.gain.value = volumn;
                global_bpm = oopsJson.TimePoint[0].BPM;
                global_Beat = oopsJson.TimePoint[0].Beat;
    
                audioBufferSourceNode.onended = bpm_anime_stop;
                document.getElementById("choiceSong").style.display = "none";
                shining_screen(global_bpm); //提前初始化动画，不可删除
                shining_kiai(global_bpm, false); //提前初始化动画，不可删除
                document.getElementById("light_screen").style.display = "block";
                
                if (oopsJson.BackgroundImage != ""){
                    // let target_bg_path = oopsJson.Dir + oopsJson.BackgroundImage; //本地读取，暂时禁用
                    let target_bg_path = `https://dl.sayobot.cn/beatmaps/files/${oopsJson.OsuID}/${oopsJson.BackgroundImage}`; //sayobot背景图接口
                    setBackgroundImage(target_bg_path);
                }else{
                    msg(1, "该谱面没有背景图")
                }

                bpm_anime_start(global_bpm, global_Beat);
                msg(0, "播放曲目: " + oopsJson.NameFull);
                audioBufferSourceNode.start();
                quick_index = 0;
                update_song_process_timer = setInterval(update_song_process, timeline_param); //时间轴(非常重要的回调)
                played = true;
                pauseFlag = false;
            })
        }catch(e){
            msg(2, "加载谱面时发生错误");
        }

        getMusicData();
    }
    fr.readAsArrayBuffer(file);
}
function sum(numbers) {
    return numbers.reduce((sum, current) => sum + current, 0);
}
let raf;
let getMusicData = function () {
    raf = webkitRequestAnimationFrame(getMusicData);
    const audioInfoArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(audioInfoArray);
    animeDiv(audioInfoArray);
    // shining_str = (sum(audioInfoArray) * 1) / (audioInfoArray.length * 120); //根据音量分贝计算闪耀强度
    //出于节省性能方面的考虑,暂时设置闪耀强度恒为0.7
    shining_str = 0.7;
}

let initDiv = function (num, r) {
    const winWidth = document.documentElement.clientWidth;
    const winHeight = document.documentElement.clientHeight;
    const avd = 360 / num;
    const ahd = avd * Math.PI / 180;
    let stageDivEl = document.querySelector('.stage');
    for (let i = 0; i < num; i++) {
        let divEl = document.createElement('div');
        const color = "#FFFFFF"; 
        divEl.setAttribute('style','background-color:' + color + ';box-shadow:0px 0px 0px 0px ' + color + ';');
        divEl.classList.add('el');
        stageDivEl.append(divEl);
        anime({
            targets:divEl,
            rotate:[-(avd * i)],
            loop:false,
            duration:1
        })
        divEl.style.top = (winHeight / 2, winHeight / 2 + Math.cos(ahd * i) * r);
        divEl.style.left = (winWidth / 2, winWidth /2 + Math.sin(ahd * i) * r);
    }
}

var r_value = (((circle_len * document.documentElement.clientHeight) / 2) + 15) * 1;
//初始化可视化圆环
initDiv(getComputedStyle(rootElement).getPropertyValue('--beatStage_num'), r_value);

let animeDiv = function(audioInfoArray){
    let stageDivEl = document.querySelector('.stage');
    for(let i = 0,j = 90; i < stageDivEl.children.length; i++, j++){
        if(audioInfoArray[i] == 0){ //默认波频
            audioInfoArray[i] = 5;
        }
        anime({
            targets: stageDivEl.children[i],
            height: [(audioInfoArray[i] / 1.8) * (volumn + 1) * (1 + kiai_beatstage_offset)],
            duration: 10
        })
    }
}

function flashBeatCube(new_r){
    let num = getComputedStyle(rootElement).getPropertyValue('--beatStage_num');
    const winWidth = document.documentElement.clientWidth;
    const winHeight = document.documentElement.clientHeight;
    const avd = 360 / num;
    const ahd = avd * Math.PI / 180;
    var beat_stage = document.getElementById("beat_stage");
    for(var i = 0; i < beat_stage.children.length; i++){
        var divEl = beat_stage.children[i];
        divEl.style.top = (winHeight / 2, winHeight / 2 + Math.cos(ahd * i) * new_r);
        divEl.style.left = (winWidth / 2, winWidth / 2 + Math.sin(ahd * i) * new_r);
    }
}

window.addEventListener('resize', function(event) {
    const winHeight = document.documentElement.clientHeight;
    var beatCube_width = (((circle_len * winHeight) / 2) + 15) * 1;
    flashBeatCube(beatCube_width);
    updateBackgroundImage();
});

window.addEventListener('wheel', function(event) {
    volumn_add(-event.deltaY / 1800);
});

let start_beatCube;
let pauseFlag = false; // false ==> pause, true ==> play

function pause_or_play(){
    if (played == false){
        return;
    }
    if (pauseFlag == false){
        anime_pause(start_beatCube);
        if (global_KiaiTime == true){
            anime_pause(flicker_light_kiai_left);
            anime_pause(flicker_light_kiai_right);
            anime_pause(flicker_light_kiai_ball);
        }else{
            anime_pause(flicker_light);
        }
        audioCtx.suspend();
        // console.log("暂停播放");
        msg(0, "已暂停");
        // document.getElementById("play_pause").value = "播放";
        pauseFlag = true;
    }else{
        anime_play(start_beatCube);
        if (global_KiaiTime == true){
            anime_play(flicker_light_kiai_left);
            anime_play(flicker_light_kiai_right);
            anime_play(flicker_light_kiai_ball)
        }else{
            anime_play(flicker_light);
        }
        audioCtx.resume();
        // console.log("继续播放");
        msg(0, "继续播放");
        // document.getElementById("play_pause").value = "暂停";
        pauseFlag = false;
    }
}
function loop_start_or_stop(){
    if (loopFlag == false){ // 单曲循环
        msg(0, "已开启单曲循环");
        loopFlag = true;
    }else{ //无
        msg(0, "已关闭单曲循环");
        loopFlag = false;
    }
}

let curson_sign = false; //是否显示鼠标光标(初始设置为false, 防止第一次行为无效)
window.addEventListener('keydown', function(event) {
    switch(event.key){
        case "ArrowUp":
        case "ArrowDown":
            if (event.key == "ArrowUp"){ //音量加
                volumn_add(0.04);
            }else{ //音量减
                volumn_add(-0.04);
            }
            break;
        case " ":
            pause_or_play();
            break;
        case "c":
        case "C":
            loop_start_or_stop();
            break;
        case "q":
        case "Q":
        case "w":
        case "W":
            if ((event.key).toLowerCase() == "q"){ //律动球透明
                rhythm_ball_opacity(-0.05);
            }else{ //律动球现形
                rhythm_ball_opacity(+0.05);
            }
            break;
        case "a":
        case "A":
            parallax_sign = !parallax_sign;
            msg(0, "已" + (parallax_sign ? "开启" : "关闭") + "视差特效");
            break;
        case "h":
        case "H":
            if (curson_sign == true){
                document.body.style.cursor = "";
            }else{
                document.body.style.cursor = "none";
            }
            curson_sign = !curson_sign;
            msg(0, (curson_sign ? "隐藏" : "显示") + "鼠标光标");
            break;
    }
});
function rhythm_ball_opacity(add_value){
    let rhythm_ball = document.getElementById("beatCube");
    let parallax_musicStage = document.getElementById("parallax_musicStage");
    let light_ball = document.getElementById("light_ball");
    let ball_border_lace = document.getElementById("ball_border_lace");
    let current_opacity = rhythm_ball.style.opacity;
    if (current_opacity == ""){
        const rhythm_ball_styles = window.getComputedStyle(rhythm_ball);
        current_opacity = parseFloat(rhythm_ball_styles.getPropertyValue('opacity'));
    }else{
        current_opacity = parseFloat(current_opacity);
    }
    
    current_opacity += add_value;
    if (current_opacity > 0){
        light_ball.style.display = "block";
    }
    if (current_opacity > 1){
        current_opacity = 1;
    }
    if (current_opacity < 0){
        light_ball.style.display = "none";
        current_opacity = 0;
    }
    rhythm_ball.style.opacity = current_opacity;
    parallax_musicStage.style.opacity = current_opacity;

    ball_border_lace.style.opacity = current_opacity;

    msg(0, "律动球当前透明度: " + parseInt(current_opacity * 100));
}

function anime_pause(anime_object){
    if (anime_object.paused == false){
        anime_object.pause();
    }
}
function anime_play(anime_object){
    if (anime_object.paused == true){
        anime_object.play();
    }
}

function bpm_anime_start(bpm, beat){ //开始激活BPM特效动画
    let beatCube = document.getElementById("beatCube");
    let ball_border_lace = document.getElementById("ball_border_lace");
    let light_ball = document.getElementById("light_ball");

    if (bpm > 170){
        bpm = 170; //出于节省性能方面的考虑,律动球的跳动BPM被限制为180
    }
    start_beatCube = anime({
        targets: [beatCube, ball_border_lace, light_ball],
        duration: (60000 / bpm),
        easing: "linear",
        loop: true,
        autoplay: false,
        update: function (){
            const winHeight = document.documentElement.clientHeight;
            var scale_num = beatCube.style.transform.slice(6, -1); //动画放大倍数
            var beatCube_width = (((circle_len * winHeight) / 2) + 15) * parseFloat(scale_num);
            flashBeatCube(beatCube_width);
        },
        keyframes: [
            {scale : 1.00},
            {scale : 1.095},
            {scale : 1.085},
            {scale : 1.095},
            {scale : 1.09},
            {scale : 1.08},
            {scale : 1.068},
            {scale : 1.073},
            {scale : 1.061},
            {scale : 1.06},
            {scale : 1.00},
          ]
    });
    start_beatCube.restart();

    shining(bpm, beat, true);
    pauseFlag = false;
}
function bpm_anime_stop(){ //歌曲结束
    document.getElementById("choiceSong").style.display = "block";
    document.getElementById("light_screen").style.display = "none";
    start_beatCube.reset();
    flicker_light.reset();
    flicker_light_kiai_left.reset();
    flicker_light_kiai_right.reset();
    flicker_light_kiai_ball.reset();
    const winHeight = document.documentElement.clientHeight;
    var scale_num = beatCube.style.transform.slice(6, -1);
    var beatCube_width = (((circle_len * winHeight) / 2) + 15) * parseFloat(scale_num);
    flashBeatCube(beatCube_width);
    clearInterval(update_song_process_timer);
    played = false;

    gainNode.disconnect();
    audioBufferSourceNode.disconnect();
    audioCtx.close();
    // audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx = new window.AudioContext();
    analyser = audioCtx.createAnalyser();
    audioBufferSourceNode.stop();
    cancelAnimationFrame(raf);

    if (loopFlag == true){ //继续播放
        if (audioBufferSourceNode != null) {
            audioBufferSourceNode.stop();
        }
        audioBufferSourceNode = null;
        audioBufferSourceNode = audioCtx.createBufferSource();
        audioBufferSourceNode.buffer = global_buffer;
        audioBufferSourceNode.connect(audioCtx.destination);
        audioBufferSourceNode.connect(analyser);
        audioBufferSourceNode.loop = false; //循环播放

        gainNode = audioCtx.createGain();
        audioBufferSourceNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        gainNode.gain.value = volumn;
        global_bpm = oopsJson.TimePoint[0].BPM;
        global_Beat = oopsJson.TimePoint[0].Beat;

        audioBufferSourceNode.onended = bpm_anime_stop;
        document.getElementById("choiceSong").style.display = "none";
        document.getElementById("light_screen").style.display = "block";
        
        bpm_anime_start(global_bpm, global_Beat);
        audioBufferSourceNode.start();
        quick_index = 0;
        update_song_process_timer = setInterval(update_song_process, timeline_param); //时间轴(非常重要的回调)
        getMusicData();

        msg(0, "已自动单曲循环")
        played = true;
        pauseFlag = false;
    }
    else{
        //global_buffer clear
        setDefaultBackgroundImage();
    }
}

function msg(level, text){
    var msgBox = document.getElementById("msgBox");
    msgBox.style.animation = "";
    let msg_type = ""
    switch (level){ //0:normal    1:warning    2:error
        case 0:
            msg_type = "msg_normal"
            break;
        case 1:
            msg_type = "msg_warning"
            break;
        case 2:
            msg_type = "msg_error"
            break;
    }
    msgBox.classList.remove("msg_normal", "msg_warning", "msg_error", "short_msg", "long_msg")

    msgBox.classList.add("short_msg")
    msgBox.classList.add(msg_type)

    msgBox.innerText = text;
    start_msg.restart();
}

function msg_long(level, text){
    var msgBox = document.getElementById("msgBox");
    msgBox.style.animation = "";
    let msg_type = ""
    switch (level){ //0:normal    1:warning    2:error
        case 0:
            msg_type = "msg_normal"
            break;
        case 1:
            msg_type = "msg_warning"
            break;
        case 2:
            msg_type = "msg_error"
            break;
    }
    msgBox.classList.remove("msg_normal", "msg_warning", "msg_error", "short_msg", "long_msg")

    msgBox.classList.add("long_msg")
    msgBox.classList.add(msg_type)

    msgBox.innerText = text;
    start_msg.restart();
}

function volumn_add(addValue){
    let max_volumn = 0.3; //在这里设置最大音量(0为音源最大音量,超过0可能会不可避免地带来音质降低的问题)
    let min_volumn = -1; //在这里设置最小音量(-1为静音)
    
    volumn += addValue;

    if (volumn >= max_volumn){ //max
        volumn = max_volumn;
    }
    if (volumn <= min_volumn){ //min
        volumn = min_volumn;
    }
    
    let now_volumn = (volumn + 1) * 100;
    msg(0, "当前音量: " + parseInt((now_volumn * 100) / ((max_volumn + 1) * 100)));

    if (played == true){
        gainNode.gain.value = volumn;
    }
}

//此功能保留开发
function process_add(addValue){  //快进/快退
    //addValue是毫秒数
    //暂时先不管特效
    //特效用seek()，歌曲用start();对于特效，其定位可能需要有一定程度的计算

    //是否需要重新连接增益? 是的，尝试重新连接所有增益
    let current_play_process = audioCtx.currentTime;
    gainNode.disconnect();
    audioCtx.close();
    audioCtx = new window.AudioContext();
    
    if (audioBufferSourceNode != null) {
        audioBufferSourceNode.stop();
    }
    audioBufferSourceNode = null;
    audioBufferSourceNode = audioCtx.createBufferSource();
    audioBufferSourceNode.buffer = global_buffer;
    audioBufferSourceNode.connect(audioCtx.destination);
    // audioBufferSourceNode.connect(analyser);
    audioBufferSourceNode.loop = false;
    
    let user_process = current_play_process + (addValue / 1000);
    console.log(user_process);
    if (user_process > 0){
        audioBufferSourceNode.start(0, user_process);
    }
    // start_beatCube.seek(addValue);
    // flicker_light.seek(addValue);
}

let global_KiaiIndex = -1;

function update_song_process(){
    let process = document.getElementById("process_music");
    const winWidth = document.documentElement.clientWidth;
    let max_len = audioBufferSourceNode.buffer.duration;
    let current_len = audioCtx.currentTime;
    new_width = (current_len * winWidth) / max_len;
    anime({
        targets: process,
        width: [new_width],
        duration: 10
    })

    let millTime = audioCtx.currentTime * 1000; //当前歌曲进度(毫秒)
    let current_Index = 0;
    let current_Bpm = global_bpm;
    let current_Kiai = false;
    let current_Beat = global_Beat; //一小节拍数
    let current_KiaiTime = false;

    for (let i = quick_index; i < oopsJson.TimePointNum; i++){
        if ((millTime >= oopsJson.TimePoint[i].StartTime) && (millTime <= oopsJson.TimePoint[i].EndTime)){

            current_Bpm = oopsJson.TimePoint[i].BPM;
            current_KiaiTime = oopsJson.TimePoint[i].Kiai;
            current_Kiai = oopsJson.TimePoint[i].FirstKiai;
            oopsJson.TimePoint[i].FirstKiai = false; //防止该区间被抵达多次，而触发多次kiai特效
            current_Index = i;
            current_Beat = oopsJson.TimePoint[i].Beat;
            // console.log("抵达区间: " + i + " 该区间是否为Kiai时间: " + (oopsJson.TimePoint[i].Kiai))
            quick_index = i;
            break;
        }
    }


    if ((current_Bpm != global_bpm) && (current_Bpm != 0) || (current_Beat != global_Beat)){
        start_beatCube.reset();
        start_beatCube.duration = (60000 / current_Bpm);
        start_beatCube.restart();

        if (current_Beat != global_Beat){
            global_Beat = current_Beat;
        }

        global_bpm = current_Bpm;
    }

    if (global_KiaiTime != current_KiaiTime){
        if (current_KiaiTime == true){ //Kiai时间
            kiai_beatstage_offset = 0.4;
            flicker_light.reset();
            flicker_light_kiai_left.reset();
            flicker_light_kiai_right.reset();
            flicker_light_kiai_ball.reset();
            shining_kiai(global_bpm, true);
        }else{ //非Kiai时间
            kiai_beatstage_offset = 0;
            flicker_light.reset();
            flicker_light_kiai_left.reset();
            flicker_light_kiai_right.reset();
            flicker_light_kiai_ball.reset();
            shining(global_bpm, current_Beat, true);
        }
        global_KiaiTime = current_KiaiTime;
    }

    if (current_Kiai == true){
        flicker_light_screen.reset();
        shining_screen(global_bpm);
    }

}