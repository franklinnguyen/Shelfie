import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import shelfieWideLogo from "../assets/images/ShelfieWideLogo.svg";
import woodPattern from "../assets/images/WoodPattern.svg";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = ({ handleLogin }) => {
  const navigate = useNavigate();

  const onLoginSuccess = (credentialResponse) => {
    if (handleLogin) {
      handleLogin(credentialResponse);
    }
    navigate("/room");
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