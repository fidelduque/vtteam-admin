/* eslint-disable react/jsx-no-comment-textnodes */
import React from 'react';
import {Auth} from "aws-amplify";
import logo from './logo.svg';
import './App.css';
import MainMenu from './components/Menu';
import {
  withAuthenticator,
  Button,
} from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';
//@ts-ignore
function App({ signOut, user }) {
  return (
    //@ts-ignore
    <><div id='content'>
      <MainMenu name={user.username} signOut={signOut}></MainMenu>
    {/* <Button onClick={signOut}>Sign out</Button> */}
   
  </div></>
  );
}

export default withAuthenticator(App);
