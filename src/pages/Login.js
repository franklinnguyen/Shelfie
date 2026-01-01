import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./Login.css";
import shelfieWideLogo from "../assets/images/ShelfieWideLogo.svg";
import woodPattern from "../assets/images/WoodPattern.svg";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const GoogleIcon = () => (
  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const LoginButton = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info from Google using the access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        const userInfo = await userInfoResponse.json();

        // Create user object similar to JWT decode format
        const formattedUserInfo = {
          sub: userInfo.sub,
          email: userInfo.email,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          picture: userInfo.picture,
        };

        setUser(formattedUserInfo);

        // Fetch or create user in database to get username
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
          navigate('/');
        }
      } catch (error) {
        console.error('Error during login:', error);
        navigate('/');
      }
    },
    onError: (error) => console.log('Login Failed:', error),
  });

  return (
    <button className="google-login-button" onClick={() => login()}>
      <GoogleIcon />
      <span>Continue with Google</span>
    </button>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { enterGuestMode } = useUser();

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
                      <LoginButton />
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