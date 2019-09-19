const { login } = require("../controller/user");
const { SuccessModel, ErrorModel } = require("../model/resModel.js");

// 设置coolie 的过期时间
const getCoolieExpires = () => {
    const d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
    return d.toGMTString();
}
// 2019-09-07T01:25:45.830Z
const handleUserRouter = (req, res) => {
    const url = req.url;
    const method = req.method;
    const path = url.split("?")[0];
    if (method === "POST" && path === "/api/user/login") {
        const { username, password } = req.body;
        // const { username, password } = req.query;
        const result = login(username, password);
        return result.then(data => {
            if (data.username) {
                //  设置session
                req.session.username = data.username;
                req.session.realname = data.realName;
                res.setHeader('Set-Cookie', `username=${data.username}; path=/; httpOnly; expires=${getCoolieExpires()}`);
                return new SuccessModel();
            }
            return new ErrorModel("登录失败");
        });
    }

    // 登陆验证的测试

    if (method === 'GET' && path === '/api/user/login-test') {
        //   if (req.cookie.username) {
        //     return Promise.resolve(new SuccessModel());
        //   }
        //   return Promise.resolve(new ErrorModel('尚未登陆。'));
        // }
        if (req.session.username) {
            return Promise.resolve(
                new SuccessModel({
                    session: req.session
                })
            );
        }
        return Promise.resolve(
            new ErrorModel('尚未登录')
        );
    }
};

module.exports = handleUserRouter;