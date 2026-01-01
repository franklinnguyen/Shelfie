import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useUser } from "../context/UserContext";
import "./Login.css";
import shelfieWideLogo from "../assets/images/ShelfieWideLogo.svg";
import woodPattern from "../assets/images/WoodPattern.svg";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = ({ handleLogin }) => {
  const navigate = useNavigate();
  const { setUser, enterGuestMode } = useUser();

  const onLoginSuccess = async (credentialResponse) => {
    // Decode the JWT to get user info
    const userInfo = jwtDecode(credentialResponse.credential);
    setUser(userInfo);

    if (handleLogin) {
      handleLogin(credentialResponse);
    }

    // Fetch or create user in database to get username
    try {
      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: userInfo.sub,
          email: userInfo.email,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          picture: userInfo.picture,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        navigate(`/${userData.username}`);
      } else {
        // Fallback to home if there's an error
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/');
    }
  };

  const handleGuestMode = async () => {
    await enterGuestMode();
    navigate('/');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="content">
        <ul>
          <li>
            <div className="wood">
              <img src={woodPattern} alt="Wood background" />
            </div>
            <div className="book">
              <ul className="front">
                <li>
                  <div className="frontcover">
                    <div className="frontcover-top">
                      <h1 className="welcome-text">Welcome to</h1>
                      <img src={shelfieWideLogo} alt="Shelfie Logo" className="logo" />
                      <div className="credits-container">
                        <h4 className="front-subtext">Written by Grace Li, Franklin Nguyen,</h4>
                        <h4 className="front-subtext">and Dannell Lopez</h4>
                      </div>
                    </div>
                  </div>
                </li>
                <li></li>
              </ul>
              <ul className="page">
                <li></li>
                <li>
                  <div className="page-content">
                    <div className="login-button-container">
                      <h4 className="page-start-text">Start your story today...</h4>
                      <GoogleLogin
                        onSuccess={onLoginSuccess}
                        onError={(err) => console.log(err)}
                        theme="filled_blue"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                      />
                      <div className="guest-mode-divider">
                        <span>or</span>
                      </div>
                      <button className="guest-mode-button" onClick={handleGuestMode}>
                        Continue as Guest
                      </button>
                    </div>
                  </div>
                </li>
                <li></li>
                <li></li>
                <li></li>
              </ul>
              <ul className="back">
                <li></li>
                <li></li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;