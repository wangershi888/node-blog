const {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog
} = require("../controller/blog.js");
const { SuccessModel, ErrorModel } = require("../model/resModel.js");

// 统一的登录验证函数
const loginCheck = (req) => {
    if (req.session.username) {
        if (!req.session.username) {
            return Promise.resolve(
                new ErrorModel('尚未登录')
            );
        }
    }
}

const handleBlogRouter = (req, res) => {
    const method = req.method;
    const url = req.url;
    const path = url.split("?")[0];
    const id = req.query.id;

    if (method === "GET" && path === "/api/blog/list") {
        // console.log('this is query',req.query);

        const author = req.query.author || "";
        const keyword = req.query.keyword || "";
        const result = getList(author, keyword);
        console.log('this is result', result);
        // 因为返回的是一个promise对象
        return result.then(listData => {
            // console.log('this is listdata',listData);
            return new SuccessModel(listData);
        });
        // const listData = getList(author, keyword);
        // return new SuccessModel(listData);
    }
    if (method === "GET" && path === "/api/blog/detail") {
        // const id = req.query.id;
        // const data = getDetail(id);
        // return new SuccessModel(data);

        const result = getDetail(id);
        return result.then(data => {
            return new SuccessModel(data);
        });
    }

    if (method === "POST" && path === "/api/blog/new") {
        // const blogData = req.body;
        // const data = newBlog(blogData);
        // return new SuccessModel(data);
        // const author = "zhangsan";

        const loginCheckResult = loginCheck(req);
        if (loginCheckResult) {
            // 说明未登录
            return loginCheck;
        }
        req.body.author = req.session.usernam;

        req.body.author = "zhangsan";
        const result = newBlog(req.body);
        return result.then(data => {
            return new SuccessModel(data);
        });
    }

    if (method === "POST" && path === "/api/blog/update") {
        const result = updateBlog(id, req.body);
        const loginCheckResult = loginCheck(req);
        if (loginCheckResult) {
            // 说明未登录
            return loginCheck;
        }
        return result.then(val => {
            if (val) {
                return new SuccessModel();
            } else {
                return new ErrorModel("更新博客失败");
            }
        });
    }
    // console.log('这是blog中的path',path.referer);
    // console.log('这是path',req);
    if (method === "POST" && path === "/api/blog/del") {
        const result = delBlog(id, author);

        const loginCheckResult = loginCheck(req);
        if (loginCheckResult) {
            // 说明未登录
            return loginCheck;
        }
        const author = req.session.usernam;
        return result.then(val => {
            if (val) {
                return new SuccessModel();
            } else {
                return new ErrorModel("删除博客失败");
            }
        });
    }
};

module.exports = handleBlogRouter;