// middlewares/authorize.js
export default function authorize(role) {
  return (req, res, next) => {
    console.log("ROLE CHECK:", req.user); // ⬅️ dòng này giúp kiểm tra xem token có chứa role không
    if (!req.user || req.user.role !== role) {
      return res.status(403).send({ error: "Forbidden" });
    }
    next();
  };
}
