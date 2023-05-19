import express from "express";
import { login, googleAuth, register } from "../controllers/auth.js";
import multer from "multer";

const router = express.Router();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });


router.post("/login", login);

router.post("/register", upload.single("picture"), register);

router.post("/google", googleAuth);



export default router;