import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied");
      //handle if the token does not exist
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
      //لو التوكن بادء ب بارر حياخد الاسترينج اللى بعد كلمة بارر من الشمال عشان هو ده التوكن الاساسى
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};