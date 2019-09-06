const querystring = require('querystring');
const handleUserRouter = require('./src/router/user.js');
const handleBlogRouter = require('./src/router/blog.js');

// session 数据
const SESSION_DATA = {};

// 设置coolie 的过期时间
const getCoolieExpires = () => {
    const d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60 *1000));
    return d.toGMTString();
  }

  
const getPostData = req => {
    const promise = new Promise((res,rej) => {
        if(req.method !== 'POST'){
            res({});
            return;
        }
        if(req.headers['content-type'] !== 'application/json'){
            res({});
            return;
        }
        let postData = '';
        req.on('data',chunk => {
            postData += chunk.toString();
        });
        req.on('end',() => {
            if(!postData){
                res({});
                return;
            }
            res(JSON.parse(postData));
        });
    });
    return promise;
}

const serverHandle = (req,res) => {
    res.setHeader('Content-type','application/json');

    req.query = querystring.parse(req.url.split('?')[1]);

    req.cookie = {};
    const cookieStr = req.headers.cookie || '';
    cookieStr.split(';').forEach(item => {
        if(!item){
            return;
        }
        const arr = item.split('=');
        const key = arr[0].trim();
        const val = arr[1].trim();
        // console.log("这是cookie",req.headers.cookie);
        req.cookie[key] = val;
    });

    let needSetCookie = false;
    if(req.cookie.userid){
        if(!SESSION_DATA[userId]){
            SESSION_DATA[userId] = {};
        }
    }else{
        needSetCookie = true;
        userId = Date.now() + Math.random();
        userId = `${Date.now()}_${Math.random()}`
        SESSION_DATA[userId] = {};
    }
    req.session = SESSION_DATA[userId];

    getPostData(req).then(postData => {
        req.body = postData;
        const blogResult = handleBlogRouter(req,res);
        if(blogResult){
            blogResult.then(blogData => {
                if(needSetCookie){
                    //  将生成的id写在cookie里边
                    res.setHeader('Set-Cookie',`userid=${data.userId}; path=/; httpOnly; expires=${getCoolieExpires()}`);
                }
                res.end(JSON.stringify(blogData));
            });
            return;
        }
    });

    const userResult = handleUserRouter(req,res);
    if(userResult){
        userResult.then(userData => {
            res.end(JSON.stringify(userData));
        });
        return;
    }
}

module.exports = serverHandle;