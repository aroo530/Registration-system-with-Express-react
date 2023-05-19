import { EditOutlined as EditOutlinedIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  Typography,
  useTheme,
} from "@mui/material";

import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUpdatedUser } from "state";

import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserWidget = () => {
  const [user, setUser] = useState(null);
  const [picture, setPicture] = useState(null);

  const [isModified, setIsModified] = useState(false); // New state variable to track changes
  const { palette } = useTheme();
  const isNonMobile = useMediaQuery("(min-width:500px)");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dark = palette.neutral.dark;

  const token = localStorage.getItem("token");
  const url = process.env.API_URL || "http://localhost:3000";

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });

    setIsModified(true); // Set isModified to true when input fields are modified
  };
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getUser = async () => {
    const tmp = JSON.parse(window.localStorage.getItem("persist:root")).user;
    const data = JSON.parse(tmp);

    const id = data._id || data.user._id;

    const response = await axios.get(`${url}/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setUser(response.data);
  };
  const updateProfile = async () => {
    try {
      let formData = new FormData();
      formData.append("firstName", user.firstName);
      formData.append("lastName", user.lastName);
      formData.append("email", user.email);
      formData.append("_id", user._id);

      formData.append("picture", picture);

      formData.append("upload_preset", "mern");

      const data = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        _id: user._id,
      };
      const response = await axios.put(`${url}/user/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(
        setUpdatedUser({
          user: response.data,
        })
      );
      alert("Profile Updated");
      // reload the page
      window.location.reload();
      setIsModified(false); // Set isModified to false when changes are saved
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return null;
  }

  return (
    <WidgetWrapper>
      <Box
        display="grid"
        gap="30px"
        paddingBottom="20px"
        paddingTop="20px"
        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        sx={{
          "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
        }}
      >
        <img
          src={`data:image/jpeg;base64, ${user.picturePath}`}
          width="200px"
          height="200px"
          alt="user"
        />
      </Box>
      <Dropzone
        acceptedFiles=".jpg,.jpeg,.png"
        multiple={false}
        onDrop={(acceptedFiles) => {
          setPicture(acceptedFiles[0]);
          setIsModified(true); // Set isModified to true when input fields are modified
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <Box
            {...getRootProps()}
            border={`2px dashed ${palette.primary.main}`}
            p="1rem"
            sx={{ "&:hover": { cursor: "pointer" } }}
          >
            <input {...getInputProps()} />
            {!picture ? (
              <p>Upload new profile Picture</p>
            ) : (
              <FlexBetween>
                <Typography>{picture.name}</Typography>
                <EditOutlinedIcon />
              </FlexBetween>
            )}
          </Box>
        )}
      </Dropzone>
      <Box
        display="grid"
        gap="30px"
        paddingBottom="20px"
        paddingTop="20px"
        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        sx={{
          "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
        }}
      >
        <TextField
          label="First Name"
          name="firstName"
          value={user.firstName}
          onChange={handleInputChange}
          sx={{ gridColumn: "span 3" }}
        />
      </Box>
      <Box
        display="grid"
        gap="30px"
        paddingBottom="20px"
        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        sx={{
          "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
        }}
      >
        <TextField
          label="Last Name"
          name="lastName"
          value={user.lastName}
          onChange={handleInputChange}
          sx={{ gridColumn: "span 3" }}
        />
      </Box>

      <Box
        display="grid"
        gap="30px"
        paddingBottom="20px"
        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        sx={{
          "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
        }}
      >
        <TextField
          label="Email"
          name="email"
          value={user.email}
          onChange={handleInputChange}
          error={!isValidEmail(user.email)}
          helperText={!isValidEmail(user.email) ? "Invalid email format" : ""}
          sx={{ gridColumn: "span 3" }}
        />
      </Box>

      {/* BUTTONS */}
      <Box>
        <Button
          type="submit"
          sx={{
            m: "1rem 0.5",
            p: "1rem",
            backgroundColor: palette.info.main,
            color: palette.background.alt,
            "&:hover": { color: palette.info.light },
          }}
          onClick={() => updateProfile()}
          disabled={!isModified}
        >
          Save Changes
        </Button>
      </Box>
    </WidgetWrapper>
  );
};

export default UserWidget;
