const TokenService = require("../services/TokenService");

const authToken = async (req, res) => {
  try {
    const result = await TokenService.authToken(req);
    if (result.success) {
      return res.status(200).json({ token: result.token });
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verifyAuth = async (req, res) => {
  try {
    const result = await TokenService.verifyAuth(req);
    if (result.success) {
      let iframeSrc = `http://localhost:3000/user/home/api/${req.user.operatorId}/${req.user.userId}`;
      // let iframeSrc = `http://100.28.41.166:9002/user/home/api/${data.username}`;
      res.send(
        `<iframe src="${iframeSrc}" height="800px" width="100%"></iframe>`
      );
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  authToken,
  verifyAuth,
};
