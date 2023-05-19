import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  Typography,
  useTheme,
} from "@mui/material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";

import { Formik } from "formik";
import * as yup from "yup"; //validation library
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import Dropzone from "react-dropzone";
import FlexBetween from "components/FlexBetween";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import axios from "axios";

const registerSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("required"),
});

const initialValuesRegister = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  picture: "",
};

const loginSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
});

const initialValuesLogin = {
  email: "",
  password: "",
};

const url = process.env.API_URL || "http://localhost:3000";
const Form = () => {
  const [pageType, setPageType] = useState("login");
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  let isLogin = pageType === "login";
  let isRegister = pageType === "register";

  const handleFormSubmit = async (values, onSubmitProps) => {
    if (isLogin) await login(values, onSubmitProps);
    if (isRegister) await register(values, onSubmitProps);
  };
  //الvaluesاللى عملتها تحت حتتبعت للفانكشن بتاعت handleformsubmit
  //وبعديها تتبعت للفنكشن بتاعت الregister
  //كان ممكن نبعت الvalue ديه للفورم بس عشان عندنا صورة لازم نعمل
  //formdata
  const register = async (values, onSubmitProps) => {
    if (values.password !== values.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const valuesCopy = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      picture: values.picture,
    };

    try {
      const savedUserResponse = await axios.post(
        `${url}/auth/register`,
        { ...valuesCopy },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      console.log(savedUserResponse);

      if (!savedUserResponse) {
        return;
      }
      const data = savedUserResponse.data;
      console.log(data);
      alert("User created successfully Proceed to login");
      onSubmitProps.resetForm();

      navigate("/auth");
      setPageType("login");
    } catch (err) {
      // res.status(500).json({ message: err.message });
      alert(err.response.data.message);
    }
  };

  const login = async (values, onSubmitProps) => {
    try {
      const response = await axios.post(
        `${url}/auth/login`,
        {
          email: values.email,
          password: values.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      console.log(response);
      if (!response) {
        return;
      }
      console.log(response.data);
      const data = response.data;
      onSubmitProps.resetForm();

      window.localStorage.setItem("token", data.token);
      window.localStorage.setItem("loggedIn", true);

      onSubmitProps.resetForm();
      dispatch(
        setLogin({
          token: data.token,
          user: data.user,
        })
      );
      navigate("/home");
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };

  const googleSignIn = async (credentialResponse) => {
    try {
      const data = {
        credintials: credentialResponse,
      };
      const response = await axios.post(
        `${url}/auth/google`,
        { ...data },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      console.log(response);
      if (!response) {
        return;
      }

      dispatch(
        setLogin({
          token: response.data.token,
          user: response.data.user,
        })
      );
      navigate("/profile");
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };

  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
      validationSchema={isLogin ? loginSchema : registerSchema}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
        resetForm,
      }) => (
        <>
          <Box>
            <GoogleOAuthProvider clientId="603824360360-kabs0n2tfebu3hrab3l085pqmrba9m4p.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  googleSignIn(credentialResponse);
                  console.log(credentialResponse);
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </GoogleOAuthProvider>
            <Button
              variant="outlined"
              sx={{
                color: palette.primary.main,
                borderColor: palette.primary.main,
              }}
              onClick={() => {
                googleSignIn({
                  credential:
                    "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyMjgzOGMxYzhiZjllZGNmMWY1MDUwNjYyZTU0YmNiMWFkYjViNWYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2ODQ1MzIwNjYsImF1ZCI6IjYwMzgyNDM2MDM2MC1rYWJzMG4ydGZlYnUzaHJhYjNsMDg1cHFtcmJhOW00cC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExMDE0NDQ3ODUyMTg4NTM5MDAzOCIsImVtYWlsIjoiYXJzYW55bWlsYWQ0NUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXpwIjoiNjAzODI0MzYwMzYwLWthYnMwbjJ0ZmVidTNocmFiM2wwODVwcW1yYmE5bTRwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwibmFtZSI6ImFyc2FueSBtaWxhZCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BR05teXhidVR0ZzVYVFZRYmE1cUpWakE2TFVBX2RuQ2E2S2J5aWlWU1Q3MFVRPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6ImFyc2FueSIsImZhbWlseV9uYW1lIjoibWlsYWQiLCJpYXQiOjE2ODQ1MzIzNjYsImV4cCI6MTY4NDUzNTk2NiwianRpIjoiNjQxYjU2MjBmNDlkNzY2MTIyZGI5OTBkM2JhMGQ1MDQxYzVlMDgwOSJ9.e952x7pHBezJNIrqm8Hyx4INPuGy0CBtY_NplSAi5Ahq0VVT-LLcJBy2Z3i63DBVbdnVFWWIe31cFPHjNGMivavtybmakoUWIcu01cc0qWtDE8UpfDEQWfzCqOkIzhkSjnLilg3PK-578hjZ3P6GPqcDrva--AgwqEf2RMIJGvqX28Nved1T9ndahu3akXHJPB4pqCtThfd7o8eAsSdO3xM1Mc5Lv1U7x8KlNLIYm5wEKU0mpfxu_dMHve2y06H_ND4RdjtF1O4QcZrWNH1wa6ASnIuWuqnZLleCL4AJotdv2ebxY9qRqb71YDydJ4zC0wYaYvpLJLo-lYC2dpu7xQ",
                  clientId:
                    "603824360360-kabs0n2tfebu3hrab3l085pqmrba9m4p.apps.googleusercontent.com",
                  select_by: "btn",
                });
              }}
            >
              Sign in with Google
            </Button>
          </Box>
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              {isRegister && (
                <>
                  <TextField
                    label="First Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.firstName}
                    name="firstName"
                    error={
                      Boolean(touched.firstName) && Boolean(errors.firstName)
                    }
                    helperText={touched.firstName && errors.firstName}
                    sx={{ gridColumn: "span 2" }}
                  />
                  <TextField
                    label="Last Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.lastName}
                    name="lastName"
                    error={
                      Boolean(touched.lastName) && Boolean(errors.lastName)
                    }
                    helperText={touched.lastName && errors.lastName}
                    sx={{ gridColumn: "span 2" }}
                  />
                  <Box
                    gridColumn="span 4"
                    border={`1px solid ${palette.neutral.medium}`}
                    borderRadius="5px"
                    p="1rem"
                  >
                    <Dropzone
                      acceptedFiles=".jpg,.jpeg,.png"
                      multiple={false}
                      onDrop={(acceptedFiles) =>
                        setFieldValue("picture", acceptedFiles[0])
                      }
                    >
                      {({ getRootProps, getInputProps }) => (
                        <Box
                          {...getRootProps()}
                          border={`2px dashed ${palette.primary.main}`}
                          p="1rem"
                          sx={{ "&:hover": { cursor: "pointer" } }}
                        >
                          <input {...getInputProps()} />
                          {!values.picture ? (
                            <p>Add your profile Picture</p>
                          ) : (
                            <FlexBetween>
                              <Typography>{values.picture.name}</Typography>
                              <EditOutlinedIcon />
                            </FlexBetween>
                          )}
                        </Box>
                      )}
                    </Dropzone>
                  </Box>
                </>
              )}
              {/* الجزء اللى فوق ده خاص بالريجيستر بس لاكن الايميل والباسورد خاص بالاتنين  */}

              <TextField
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={Boolean(touched.email) && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                label="Password"
                type="password" //hidden
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={Boolean(touched.password) && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 4" }}
              />

              {isRegister && (
                <>
                  <TextField
                    label="confirmPassword"
                    type="Password" //hidden
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.confirmPassword}
                    name="confirmPassword"
                    error={
                      Boolean(touched.confirmPassword) &&
                      Boolean(errors.confirmPassword)
                    }
                    helperText={
                      touched.confirmPassword && errors.confirmPassword
                    }
                    sx={{ gridColumn: "span 4" }}
                  />
                </>
              )}
            </Box>

            {/* BUTTONS */}
            <Box>
              <Button
                fullWidth
                type="submit"
                sx={{
                  m: "1rem 0",
                  p: "0.5rem",
                  backgroundColor: palette.info.main,
                  color: palette.background.alt,
                  "&:hover": { color: palette.info.light },
                }}
              >
                {isLogin ? "Login" : "Sign Up"}
              </Button>
              <Typography
                onClick={() => {
                  setPageType(isLogin ? "register" : "login");
                  resetForm(); //when switch btween login and the register clear the input
                }}
                sx={{
                  textDecoration: "underline",
                  color: palette.info.main,
                  "&:hover": {
                    cursor: "pointer",
                    color: palette.info.light,
                  },
                }}
              >
                {isLogin
                  ? "Don't have an account? Sign Up here."
                  : "Already have an account? Login here."}
              </Typography>
            </Box>
          </form>
        </>
      )}
    </Formik>
  );
};

export default Form;
