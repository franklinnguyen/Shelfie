import "./Login.css";
import shelfieWideLogo from "../assets/images/ShelfieWideLogo.svg";
import woodPattern from "../assets/images/WoodPattern.svg";

const Login = () => {
  return (
    <>
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
                      <h1 className="welcome-text">welcome to</h1>
                      <img src={shelfieWideLogo} alt="Shelfie Logo" className="logo" />
                      <div className="credits-container">
                        <h4 className="front-subtext">Written by Grace Li, Franklin Nguyen,</h4>
                        <h4 className="front-subtext">and Dannell Lopez</h4>
                      </div>
                    </div>
                    <div className="frontcover-bottom">
                      <h4 className="start-text">log in to continue</h4>
                      {/* Auth button will go here */}
                    </div>
                  </div>
                </li>
                <li></li>
              </ul>
              <ul className="page">
                <li />
                <li></li>
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
    </>
  );
};

export default Login;