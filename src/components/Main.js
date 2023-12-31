import React from "react";

import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import Form from "./Form";
import { client } from "@passwordless-id/webauthn"; // import the client

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Main() {
  return (
    <div className="w-full mx-auto max-w-md px-2 py-16 sm:px-0">
      <div className="outer p-5 bg-blue-500 rounded-2xl">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white-700",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white shadow"
                    : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              Login
            </Tab>

            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white-700",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white shadow"
                    : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              Signup
            </Tab>
          </Tab.List>

          <Tab.Panels className="mt-2">
            <Tab.Panel>
              <Form type="login" />
            </Tab.Panel>
            <Tab.Panel>
              <Form type="signup" />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
