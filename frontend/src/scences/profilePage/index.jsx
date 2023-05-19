import { Box, useTheme, useMediaQuery, Typography } from "@mui/material";
import { setLogout } from "state";
import { useDispatch } from "react-redux";
import UserWidget from "scences/widgets/UserWidget";

const ProfilePage = () => {
  const dispatch = useDispatch();
  // const { userId } = useParams();
  const theme = useTheme();
  // const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      <Box
        width="100%"
        backgroundColor={theme.palette.background.alt}
        p="rem 6%"
        textAlign="center"
      >
        {/* button logout */}
        <button onClick={() => dispatch(setLogout())}>Logout</button>

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
        <UserWidget />
      </Box>
    </Box>
  );
};

export default ProfilePage;
