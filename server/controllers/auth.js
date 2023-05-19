import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import User from "../models/User.js";
import axios from "axios";
import express from "express";
import path from "path";

const __dirname = path.resolve();
const router = express.Router();


/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
    } = req.body;
    console.log('req.body', req.body);
    console.log('req.file', req.file);

    const picturePath = req.file.path;

    // create basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      viewedProfile: Math.floor(Math.random() * 10000),

    });

    const savedUser = await newUser.save();
    // send the image to the client

    res.status(201).json(savedUser);


  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logging in
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all required fields" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ msg: "User does not exist. " });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password. " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;

    // get the image from the server and send the file to the client
    user.picturePath = imgToBase64(user.picturePath);

    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('error', err.message);

  }
};

export const googleAuth = async (req, res) => {
  const credintials = req.body.credintials;

  try {
    const googleToken = jwt.decode(credintials.credential);

    // check if the user exists by email
    const user = await User.findOne({ email: googleToken.email });
    console.log('user', googleToken.email);
    console.log('user', user);

    if (!user) {      // create a new user
      // since google returns the image url, we need to get the image from the url and save it to the server
      const imageFromURL = await axios.get(googleToken.picture, { responseType: "arraybuffer" });

      const picturePath = path.join(__dirname, "public/assets", `${googleToken.email}.jpg`);
      fs.writeFileSync(picturePath, imageFromURL.data);

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(googleToken.email, salt);

      const newUser = new User({
        firstName: googleToken.given_name,
        lastName: googleToken.family_name,
        email: googleToken.email,
        password: passwordHash,
        picturePath: picturePath,
        viewedProfile: Math.floor(Math.random() * 10000),
      });

      const savedUser = await newUser.save();
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

      // get the image from the server and send the file to the client
      savedUser.picturePath = imgToBase64(savedUser.picturePath);

      return res.status(201).json({ token, user: savedUser });
    } else {
      // user exists
      console.log('user exists', user);

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      // get the image from the server and send the file to the client
      user.picturePath = imgToBase64(user.picturePath);

      return res.status(200).json({ token, user });
    }


  } catch (error) {
    throw error;
  }

};
const imgToBase64 = (path) => {
  return fs.readFileSync(path, { encoding: "base64" });

};