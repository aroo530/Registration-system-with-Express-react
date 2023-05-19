import { useState } from "react";
import { Box, Button, TextField, useMediaQuery, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup"; //validation library
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";

const axios = require("axios");
const url = "http://localhost:3000";
const loginSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
});

const initialValuesLogin = {
  email: "",
  password: "",
};

const registerSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const initialValuesRegister = {
  email: "",
  password: "",
  confirmPassword: "",
};

const Form = () => {
  const [pageType] = useState("login");
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isLogin = pageType === "login";

  const handleFormSubmit = async (values, onSubmitProps) => {
    //call the backend
    if (isLogin) await login(values, onSubmitProps);
  };

  const login = async (values, onSubmitProps) => {
    // you shouldn't check if email exists here it should be done in the backend
    // send the email and password to the backend in the body of the request
    const response = axios.get(`${url}/login`, {
      email: values.email,
      password: values.password,
    });
    const loggedIn = response.data;
    console.log(loggedIn);
    navigate("/login");

    onSubmitProps.resetForm();

    // if (loggedIn) {
    //   dispatch(
    //     setLogin({
    //       user: loggedIn.user,
    //       token: loggedIn.token,
    //     })
    //   );

    //    navigate("/dashboard");
    // }
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
        <form onSubmit={handleSubmit}>
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            sx={{
              "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
            }}
          >
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
              login
            </Button>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default Form;
