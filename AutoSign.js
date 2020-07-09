//Authors: ZQA&&PBY
//Js脚本，在服务器端使用PM2管理nodejs运行。

var http = require('http');
var readline = require('readline');
let headers={
    "Cookie": '',
    "User-Agent": "Mozilla/5.0 (iPad; CPU OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ChaoXingStudy/ChaoXingStudy_3_4.3.2_ios_phone_201911291130_27 (@Kalimdor)_11391565702936108810"
}
let cookieId = ""
let route = ""
let uid = "";
activates=[]
var DataBuff  = []
var data
var classData = []
let classInfo = []
function start() {
    let username = "替换成你注册学习通用的手机号"
    let password = "替换成你的密码"
//     const rl = readline.createInterface({
//         input:process.stdin,
//         output:process.stdout
//     });
//     console.log("请输入账号密码（用空格分开，账号只能手机号）")
//     rl.on("line",(line)=>{
//         let arr = line.split(" ")
//         username = arr[0]
//         password = arr[1]
//         if(checkPhone(username))
//             console.log("手机号输入错误请重新输入")
//         else
//             rl.close();
//     })
//     rl.on("close",()=>{
        getUid(username,password)
//     })
}
function getUid(username,password){
    let options = {
        hostname:"passport2.chaoxing.com",
        path:"/mylogin",
        method:"POST",
        headers:{
            "Host":"passport2.chaoxing.com",
            "Accept":"application/json, text/javascript, */*; q=0.01",
            "Accept-Encoding":"gzip, deflate",
            "X-Requested-With":"XMLHttpRequest",
            "Accept-Language":"zh-cn",
            "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
            "Origin":"http://passport2.chaoxing.com",
            "User-Agent":"Mozilla/5.0 (iPad; CPU OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 EdgiOS/45.2.16 Mobile/15E148 Safari/605.1.15",
            "Connection":"keep-alive",
            "Referer":"http://passport2.chaoxing.com/wlogin",
            //"Content-Length":33,
            "Cookie":"JSESSIONID="+cookieId+"; route="+route+";"
        }
    }
    const postData = "msg="+username+"&vercode="+password
    const req = http.request(options,(res)=>{
        let cookie =  res.headers['set-cookie']
        if(cookie){
            let str = ""
            for(let i = 0;i < cookie.length;i++){
                str+=cookie[i].split(" ")[0]
            }
           // console.log(str)
            headers.Cookie=str
            let id =  res.headers['set-cookie'][2].split(";")[0]
            let Id = id.split("=")
            uid=Id[1];
        }

        res.on("data",(chunk)=>{
            //console.log((chunk.toString()))
        })
        res.on('end', () => {
            //console.log('响应中已无数据');
            backclazzdata()
        });
    })
    req.on("err",(e)=>{
        console.log(e.message)
    })
    req.write(postData);
    req.end();

}
function backclazzdata(){
    let options = {
        hostname:'mooc1-api.chaoxing.com',
        path:'/mycourse/backclazzdata?view=json&rss=1',
        headers:headers,
    }
    http.get(options,function (res) {
       // console.log(res)
        res.on('data', (chunk) => {
            DataBuff.push(chunk)
            //console.log(chunk.toString())
        });
        res.on('end', () => {
            let buffer = Buffer.concat(DataBuff)
            //console.log(buffer.toString())
            data =JSON.parse(buffer)
            //console.log(data)
            addData()
        });
    })
}
addData = function(){
    let count = 0
    for (let i = 0;i<data.channelList.length;i++){
        if(!data.channelList[i].content.course)
            continue;
        let pushdata = {}
        pushdata['id'] = count++
        pushdata['courseid'] = data.channelList[i].content.course.data[0].id
        pushdata['name'] = data.channelList[i].content.course.data[0].name
        pushdata['classid'] = data.channelList[i].content.id
        console.log("获取成功",pushdata)
        classData.push(pushdata)
    }

    console.log("请输入要选择的课程id(用英文逗号分隔)：")
    console.log("选择成功后，弹出的数次签到失败是程序在遍历该课程所有的签到活动；只要30秒后开始出现\"正在监控签到活动\"就没有问题。")
//     const rl = readline.createInterface({
//         input:process.stdin,
//         output:process.stdout
//     });
//     rl.on("line",(line)=>{
        let classId = [/*手动运行过一次后将要监控的课程编号写入这里，格式如下：['0','1','2',...]*/];
        //console.log(line)
//         let suc = line.split(",").every(function(elem, index, arr){
//             return elem == parseInt(elem)
//         })
//         if (suc){
//             line.split(",").forEach(function(el){
//                 this.push(parseInt(el))
//             },classId)
            console.log("选择成功")
            for(let i of classId){
                classInfo.push(classData[i])
            }
//             //console.log(classInfo)
//             rl.close();
//         }else{
//             console.log("选择失败,请重新选择")
//         }
//     })
//     rl.on("close",()=>{
        startSign()
//     })


}
startSign = function(){
    console.log(classInfo)
    let URL = []
    for( let i = 0;i< classInfo.length;i++){
        let url = "/ppt/activeAPI/taskactivelist?courseId="+classInfo[i].courseid+"&classId="+classInfo[i].classid+"&uid="+uid
        URL.push(url)
    }
    //console.log(URL)
    let ops = []
    for (let i = 0 ;i<URL.length;i++){
        let option = {
            hostname:'mobilelearn.chaoxing.com',
            path:URL[i],
            headers:headers,
        }
        ops.push(option)
    }
    //console.log(ops)
    opGet(ops)

}
async function opGet(ops) {
    let sign_count = 0
    while (1){
        let check = 1
        await sleep(30000)//这里调查询的间隔时间
        for (let i = 0;i<ops.length;i++){
            let bufferData=[]
            http.get(ops[i],function (res) {
                res.on("data",function (chunk) {
                    bufferData.push(chunk)
                })
                res.on("end", function () {
                    let buffer = JSON.parse(Buffer.concat(bufferData).toString())
                    let activeList=buffer.activeList
                    //console.log(activeList)
                    if (activeList!=undefined){
                        
                        for (let i = 0;i<activeList.length;i++){
                            if (activeList[i].nameTwo ==undefined)
                            	continue
                            //console.log(1)
                            if ((activeList[i].activeType==2 &&activeList[i].status==1)||(activeList[i].activeType==2 &&activeList[i].status==2))
                            {

                                let signurl = activeList[i].url
                                let aid = getvar(signurl)
                                //console.log(aid,uid)
                                if (!isInArray(activates,aid)){
                                    sign(aid,uid)
                                    check = 0
                                }
                            }
                        }
                    }
                    if(check){
                        console.log("【正在监控签到活动" + sign_count + "】 :" + "未查询到签到")
                        sign_count++
                    }
                })
            })
        }       
    }
}
function sign(aid,uid) {
    let option = {
        hostname:"mobilelearn.chaoxing.com",
        path:"/pptSign/stuSignajax?activeId="+aid+"&uid="+uid+"&clientip=&latitude=-1&longitude=-1&appType=15&fid=0",
        headers:headers
    }
    let lastBuff = []
    http.get(option,function (res) {
        res.on("data",function (chunk) {
            lastBuff.push(chunk)
        })
        res.on("end",function () {
            let buff = Buffer.concat(lastBuff).toString()
            if (buff=="success"){
                console.log("签到成功")
                activates.push(aid)
            }
            else
            {
                activates.push(aid)
                console.log("签到失败")
            }

        })
    })
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
function getvar(url){
    let str1 = url.split("&")
    for (let i = 0;i<str1.length;i++){
        let str2 = str1[i].split("=")
        if(str2[0] == "activePrimaryId")
            return str2[1]
    }
    return "ccc"
}
function isInArray(arr,value){
    for(var i = 0; i < arr.length; i++){
        if(value === arr[i]){
            return true;
        }
    }
    return false;
}
function checkPhone(username){ 
    let phone = username;
    if(!(/^1\d{10}$/.test(phone))){        
        return false; 
    } 
}
let options = {
    hostname:"passport2.chaoxing.com",
    path:"/wlogin",
    method:"GET",
}
const req = http.request(options,(res)=>{
   // console.log(res.headers)
    cookieId = res.headers['set-cookie'][0].split(";")[0].split("=")[1]
    route = res.headers['set-cookie'][1].split(";")[0].split("=")[1]
    res.on('data', (chunk) => {
        
      });
    res.on('end', () => {
        start()
      });
})
req.on("err",(e)=>{
    console.log(e.message)
})
req.end();
