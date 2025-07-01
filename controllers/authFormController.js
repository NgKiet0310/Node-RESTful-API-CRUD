import User from "../models/user.js";
import logger from "../middleware/logger.js";

// Hiển thị form đăng nhập
export const showLoginForm = (req, res) => {
  res.render("auth/login", {
    layout: "layouts/main",
    error: null
  });
};

// Hiển thị form đăng ký
export const showRegisterForm = (req, res) => {
  res.render("auth/register", {
    layout: "layouts/main",
    error: null
  });
};

// Xử lý đăng ký người dùng
export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render("auth/register", {
        layout: "layouts/main",
        error: "Vui lòng nhập đầy đủ thông tin"
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render("auth/register", {
        layout: "layouts/main",
        error: "Tên đăng nhập đã tồn tại"
      });
    }

    const user = new User({ username, password }); // Mặc định sẽ hash trong model
    await user.save();
    logger.info(`Đăng ký thành công: ${username}`);

    res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
};

// Xử lý đăng nhập (session)
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.render("auth/login", {
        layout: "layouts/main",
        error: "Tài khoản hoặc mật khẩu không đúng"
      });
    }

    // ✅ Ghi thông tin đăng nhập vào session
    req.session.user = {
      id: user._id,
      username: user.username
    };
    console.log("🟢 Đăng nhập thành công:", req.session.user);
    res.redirect("/admin");
  } catch (error) {
    next(error);
  }
};

// Xử lý đăng xuất
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Lỗi khi đăng xuất:", err.message);
    }
    res.redirect("/auth/login");
  });
};
