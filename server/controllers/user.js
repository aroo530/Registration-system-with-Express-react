import { log } from "console";
import User from "../models/User.js";
import fs from "fs";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await User.findById(_id);

    // get the image from the server and send the file to the client
    const image = fs.readFileSync(user.picturePath, { encoding: "base64" });
    user.picturePath = image;

    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { _id, firstName, lastName, email } = req.body;
    let updatedUser;
    if (!_id) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    if (!req.file) {
      await User.updateOne({ _id }, { firstName, lastName, email });

    } else {
      const picturePath = req.file.path;

      await User.updateOne({ _id }, { firstName, lastName, email, picturePath });

    }

    updatedUser = await User.findById(_id);
    const image = fs.readFileSync(updatedUser.picturePath, { encoding: "base64" });
    updatedUser.picturePath = image;

    // get the image from the server and send the file to the client
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('error', error.message);
  }
};