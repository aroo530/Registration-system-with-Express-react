import { Box ,Typography ,useTheme,useMediaQuery } from "@mui/material";
import Form from "../../components/adminform";
const Adminloginpage = ()=> {
    const theme = useTheme();
    const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
    return (
      <Box>
        <Box
          width="100%"
          backgroundColor={theme.palette.background.alt}
          p="rem 6%"
          textAlign="center"
        >
          <Typography fontWeight="bold" fontSize="45px" color="info.main">
            MEMQ
          </Typography>
        </Box>
  
        <Box
          width={isNonMobileScreens ? "50%" : "93%"}
          p="2rem"
          m="2rem auto"
          borderRadius="1.5rem"
          backgroundColor={theme.palette.background.alt}
        >
          <Typography fontWeight="500" variant="h4" sx={{ mb: "1.5rem" }}>
            Welcome to MEMQ
          </Typography>
          <Form />
        </Box>
      </Box>
    );
  };
  
  export default Adminloginpage;