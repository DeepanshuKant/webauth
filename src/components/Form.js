import React from "react";
import { useState } from "react";
import { client } from "@passwordless-id/webauthn";
import axios from "axios";

const Form = ({ type }) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [printCred, setPrintCred] = useState("");

  const loginHandler = async (e) => {
    e.preventDefault();

    const userDetails = {
      username: userName,
      password: password,
    };

    const challenge = "56535b13-5d93-4194-a282-f234c1c24500";
    const credentialUserId = JSON.parse(localStorage.getItem("credentialId"));

    if (!credentialUserId.id) {
      alert("Please register first");
      return;
    }

    const authentication = await client.authenticate(
      [credentialUserId.id],
      challenge,
      {
        authenticatorType: "auto",
        userVerification: "required",
        timeout: 60000,
      }
    );

    try {
      const credential = await axios.post(
        "http://localhost:4000/authenticationVerification",
        {
          authentication: {
            authenticationObj: authentication,
            credentialKey: localStorage.getItem("credentialId"),
            challenge: challenge,
          },
        }
      );

      console.log(credential);

      if (
        credential?.data?.authenticationParsed?.authenticator?.flags
          ?.userVerified
      ) {
        alert("User verified, you are logged in");
        setPrintCred(JSON.stringify(credential?.data));
        return;
      }

      console.log(credential);
    } catch (error) {
      alert("Error in authentication");
      console.log(error);
    }
    console.log("Login");
  };

  const signUpHandler = async (e) => {
    e.preventDefault();

    const userDetails = {
      username: userName,
      email: email,
      password: password,
    };

    const challenge = "a7c61ef9-dc23-4806-b486-2428938a547e";

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

    try {
      const credential = await axios.post(
        "http://localhost:4000/registrationVerification",
        { registration: JSON.stringify(registration) }
      );

      localStorage.setItem(
        "credentialId",
        credential?.data?.registrationParsed?.credential
          ? JSON.stringify(credential.data.registrationParsed.credential)
          : null
      );

      if (credential?.data?.registrationParsed?.credential) {
        setPrintCred(
          JSON.stringify(credential.data.registrationParsed.credential)
        );
        alert("User registered successfully");
        return;
      } else {
        alert("User already registered");
      }
    } catch (error) {
      alert("Error in registration");
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
      {printCred ? <h1>{printCred}</h1> : null}
    </>
  );
};

export default Form;
