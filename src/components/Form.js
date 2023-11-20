import React from "react";
import { useState } from "react";
import { client } from "@passwordless-id/webauthn";
import axios from "axios";
// import crypto from "crypto";

const Form = ({ type }) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [printCred, setPrintCred] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const loginHandler = async (e) => {
    e.preventDefault();
    setAlertMsg("");

    const userDetails = {
      username: userName,
      password: password,
    };

    if (!userDetails.username) {
      setAlertMsg("Please enter username");
      // alert("Please enter username");
      return;
    }

    // const challenge = "56535b13-5d93-4194-a282-f234c1c24500";
    try {
      const getCredentialUserId = await axios.post(
        "https://webauth-server.onrender.com/getUserCredentialIdFromDb",
        {
          username: userDetails.username,
        }
      );

      if (!getCredentialUserId?.data?.isFound) {
        // alert(
        //   "No user is created with this username yet, Please register first"
        // );

        setAlertMsg(
          "No user is created with this username yet, Please register first"
        );
        return;
      }

      const challengeGet = await axios.get(
        "https://webauth-server.onrender.com/generateChallenge"
      );

      const challenge = challengeGet?.data?.challenge;

      const credentialId = getCredentialUserId?.data?.id;

      const authentication = await client.authenticate(
        [credentialId],
        challenge,
        {
          authenticatorType: "auto",
          userVerification: "required",
          timeout: 60000,
        }
      );

      const credential = await axios.post(
        "https://webauth-server.onrender.com/authenticationVerification",
        // "https://webauth-server.onrender.com/authenticationVerification",
        {
          authentication: {
            authenticationObj: authentication,
            challenge: challenge,
            username: userDetails.username,
          },
        }
      );

      // console.log(credential);

      if (credential?.data?.isVerified) {
        setPrintCred(
          credential?.data?.authenticationParsed
            ? JSON.stringify(credential.data.authenticationParsed)
            : ""
        );
        // alert("User logged in successfully");
        setAlertMsg("User logged in successfully");
      } else {
        // alert("User not verified");
        setAlertMsg("User not verified");
      }
      // console.log(credential);
    } catch (error) {
      setAlertMsg("Error in authentication");
      // alert("Error in authentication");

      console.log(error);
    }
    setUserName("");
    setPassword("");
    console.log("Login");
  };

  const signUpHandler = async (e) => {
    e.preventDefault();

    setAlertMsg("");
    const userDetails = {
      username: userName,
      email: email,
      password: password,
    };

    if (!userDetails.username) {
      // alert("Please enter username");
      setAlertMsg("Please enter username");
      return;
    }

    try {
      // const challenge = "a7c61ef9-dc23-4806-b486-2428938a547e";
      const getCredentialUserId = await axios.post(
        "https://webauth-server.onrender.com/getUserCredentialIdFromDb",
        {
          username: userDetails.username,
        }
      );

      if (getCredentialUserId?.data?.isFound) {
        // alert(
        //   "A user is already created with this username, Please login instead"
        // );
        setAlertMsg(
          "A user is already created with this username, Please login instead"
        );
        return;
      }

      const challengeGet = await axios.get(
        "https://webauth-server.onrender.com/generateChallenge"
      );

      const challenge = challengeGet?.data?.challenge;
      // console.log(challenge);

      const registration = await client.register(
        userDetails.username,
        challenge,
        {
          authenticatorType: "auto",
          userVerification: "required",
          timeout: 60000,
          attestation: false,
          userHandle: "recommended to set it to a random 64 bytes value",
          debug: false,
        }
      );

      const credential = await axios.post(
        "https://webauth-server.onrender.com/registrationVerification",
        // "https://webauth-server.onrender.com/registrationVerification",
        {
          registration: JSON.stringify(registration),
          challenge: challenge,
        }
      );

      console.log(credential);

      if (credential?.data?.isCreated) {
        setPrintCred(
          credential?.data?.registrationParsed
            ? JSON.stringify(credential.data.registrationParsed)
            : ""
        );
        // alert("User registered successfully, Please login now!");
        setAlertMsg("User registered successfully, Please login now!");
      } else {
        // alert("User already registered with this username, Please login now!");
        setAlertMsg(
          "User already registered with this username, Please login now!"
        );
      }
    } catch (error) {
      setAlertMsg("Error in registration");
      // alert("Error in registration");
      console.log(error);
    }

    setUserName("");
    setEmail("");
    setPassword("");
  };

  return (
    <>
      <div className="outer-form h-full">
        <h1 className="text-white font-bold text-xl mb-9 mt-3">{type}</h1>
        <form
          onSubmit={type === "login" ? loginHandler : signUpHandler}
          className="flex h-full flex-col justify-start gap-5"
        >
          <input
            className="inline-block p-3 rounded-xl outline-none focus:shadow-md shadow-blue-950 transition-all duration-75 ease-in"
            type="text"
            placeholder="Enter username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <input
            className="inline-block p-3 rounded-xl outline-none focus:shadow-md shadow-blue-950 transition-all duration-75 ease-in"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="inline-block self-center p-3 rounded-xl outline-none bg-zinc-900 text-white font-bold hover:bg-zinc-800 cursor-pointer"
            type="submit"
            value={type === "login" ? "Login" : "Signup"}
          />
        </form>
      </div>
      {alertMsg ? <h1>{alertMsg}</h1> : null}
      {printCred ? <h1>{printCred}</h1> : null}
    </>
  );
};

export default Form;
