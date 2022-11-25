/* eslint-disable react/jsx-no-undef */
import { Divider, Flex, Heading, Link, withAuthenticator } from '@aws-amplify/ui-react';
import {   BrowserRouter as Router, 
    Link as ReactRouterLink,
    Routes,
    Route } from 'react-router-dom'
import React from 'react';
import {General} from './GeneralSettings';
import {Blacklist} from './Blacklist';
import Brands from './Brands';

interface IProps {
    name?: string;
    signOut: any;
  }

 

const MainMenu: React.FC<IProps> = (props: IProps) => {
    return (
        <>
        <Router>
      <Flex>
        <div id='MainMenu'>
        <ReactRouterLink to="/"  >General Settings</ReactRouterLink>
        <ReactRouterLink to="/blacklist" >Blacklist Settings</ReactRouterLink>
        <ReactRouterLink to="/brands" >Brand Settings</ReactRouterLink>
        </div>
        <Link id='logoutButton' onClick={props.signOut} alignSelf="flex-end">Logout</Link>

      </Flex>
        
        <Divider></Divider>
      <Routes>
        <Route path="/blacklist" element={<Blacklist />} />
        <Route path="/brands" element={<Brands/>} />
        <Route path="/" element={<General />} />
      </Routes>

    </Router>
        </>
      );
}

export default withAuthenticator(MainMenu);