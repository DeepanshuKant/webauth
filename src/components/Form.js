import React from "react";
import { useState } from "react";

const { CBOR } = require("cbor-web");
// import cbor from 'cbor'
// import CBOR from 'cbor-web'
// import {} from '@simplewebauthn/server'

const Form = ({ type }) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginHandler = async (e) => {
    e.preventDefault();

    const userDetails = {
      username: userName,
      password: password,
    };

    let credential = undefined;
    let assertion = null;
    let publicKeyCredentialRequestOptions = null;

    try {
      publicKeyCredentialRequestOptions = {
        challenge: Uint8Array.from(
          "WhatAmIEvenDoingHereWithoutAnyInfo%454##@2",
          (c) => c.charCodeAt(0)
        ),
        allowCredentials: [
          {
            id: Uint8Array.from(localStorage.getItem("credentialId"), (c) =>
              c.charCodeAt(0)
            ),
            type: "public-key",
            transports: ["usb", "ble", "nfc"],
          },
        ],
        timeout: 60000,
      };

      credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });
    } catch (error) {
      alert(error.message + " Please try again");
    }

    // console.log(assertion);
    // console.log(JSON.parse(localStorage.getItem("credentialId")));
    console.log("Login");
  };

  const signUpHandler = async (e) => {
    e.preventDefault();
    const userDetails = {
      username: userName,
      email: email,
      password: password,
    };

    let credential = null;
    let publicKeyCredentialCreationOptions = null;

    try {
      publicKeyCredentialCreationOptions = {
        challenge: Uint8Array.from(
          "WhatAmIEvenDoingHereWithoutAnyInfo%454##@2",
          (c) => c.charCodeAt(0)
        ),
        rp: {
          name: "localhost",
          id: "localhost",
        },
        user: {
          id: Uint8Array.from(userDetails.email, (c) => c.charCodeAt(0)),
          name: userDetails.username,
          displayName: userDetails.username,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "cross-platform",
        },
        timeout: 60000,
        attestation: "direct",
      };

      credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      });

      const utf8Decoder = new TextDecoder("utf-8");
      const decodedClientData = utf8Decoder.decode(
        credential?.response?.clientDataJSON
      );

      // parse the string as an object
      const clientDataObj = JSON.parse(decodedClientData);

      const decodedAttestationObj = CBOR?.decode(
        credential.response.attestationObject
      );

      const { authData } = decodedAttestationObj;

      const dataView = new DataView(new ArrayBuffer(2));

      const idLenBytes = authData.slice(53, 55);
      idLenBytes.forEach((value, index) => dataView.setUint8(index, value));

      const credentialIdLength = dataView.getUint16();

      // get the credential ID
      const credentialId = authData.slice(55, 55 + credentialIdLength);
      //WHere to store the credentialId
      //Solve this problem

      // const someDetail = {
      //     det: credentialId
      // }

      localStorage.setItem("credentialId", credentialId);

      // get the public key object
      const publicKeyBytes = authData.slice(55 + credentialIdLength);

      // the publicKeyBytes are encoded again as CBOR
      const publicKeyObject = CBOR.decode(publicKeyBytes.buffer);

      alert("Signup Successful, Please login now.");
    } catch (error) {
      alert(error.message + " Please try again");
    }

    setUserName("");
    setEmail("");
    setPassword("");
  };

  return (
    <>
      {console.log("navigator.credentials", navigator?.credentials)}
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
          {type !== "login" ? (
            <input
              className="inline-block p-3 rounded-xl  outline-none focus:shadow-md shadow-blue-950 transition-all duration-75 ease-in"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : null}
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
    </>
  );
};

export default Form;
