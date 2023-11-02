import React from "react";
import { useState } from "react";
import axios from "axios";
// const { CBOR } = require("cbor-web");
// import CBOR from "cbor";
import { encode, decode } from "cborg";
// import CBOR from "cbor-web";
// import {} from '@simplewebauthn/server'

function arrayBufferToBase64(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let base64 = btoa(String.fromCharCode.apply(null, uint8Array));
  return base64;
}

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

    let credential;
    let assertion;
    let publicKeyCredentialRequestOptions;

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
          name: "webauth vercel app",
          // id: "https://webauth-six.vercel.app/",
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

      // const decodedAttestationObj = CBOR.decode(
      //   credential?.response?.attestationObject
      // );

      //CONVERT THE DATA TO JASON FORMAT AND CONSOLE LOG IT
      // credential.response.attestationObject
      // console.log(credential.response.attestationObject);

      const data = {
        dataNew: arrayBufferToBase64(credential.response.attestationObject),
      };

      const resp = await axios.post("http://localhost:4000/getDecoded", data);

      const decodedAttestationObj = resp.data.data;

      // const decodedAttestationObj = decode(
      //   Buffer.from(credential?.response?.attestationObject?.buffer, "hex")
      // );

      const { authData } = decodedAttestationObj;
      // console.log(authData);

      const dataView = new DataView(new ArrayBuffer(2));

      const idLenBytes = authData.data.slice(53, 55);
      idLenBytes.forEach((value, index) => dataView.setUint8(index, value));

      const credentialIdLength = dataView.getUint16();

      // get the credential ID
      const credentialId = authData.data.slice(55, 55 + credentialIdLength);
      //WHere to store the credentialId
      //Solve this problem

      // const someDetail = {
      //     det: credentialId
      // }

      localStorage.setItem("credentialId", credentialId);

      // get the public key object
      const publicKeyBytes = authData.data.slice(55 + credentialIdLength);
      // console.log("Public Key Bytes: ", publicKeyBytes);
      // the publicKeyBytes are encoded again as CBOR
      // const publicKeyObject = decode(Buffer.from(publicKeyBytes.buffer, "hex"));
      const dataAnother = {
        dataNewAnother: arrayBufferToBase64(publicKeyBytes),
        // dataNewAnother: publicKeyBytes?.buffer,
      };

      const resp2 = await axios.post(
        "http://localhost:4000/getDecodedAnother",
        dataAnother
      );

      const publicKeyObject = new Map(JSON.parse(resp2?.data?.data));
      // console.log("resp2: ", resp2.data.data);

      // const publicKeyObject = resp2.data.data;
      // console.log(publicKeyObject);

      const createdUser = {
        username: userName,
        email: email,
        password: password,
        credentialId: credentialId,
        publicKey: publicKeyObject,
      };

      console.log("createdUser: ", createdUser);

      alert("Signup Successful, Please login now.");
    } catch (error) {
      console.log(error);
      alert(error.message + " Please try again");
    }

    setUserName("");
    setEmail("");
    setPassword("");
  };

  return (
    <>
      {/* {console.log("navigator.credentials", navigator?.credentials)} */}
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
