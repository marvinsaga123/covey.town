import { Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { TownJoinResponse } from '../../../../../classes/TownsServiceClient';
import { CoveyAppUpdate } from '../../../../../CoveyTypes';
import TownSelection from '../../../../InitialLandingPage/TownSelection';
import IntroContainer from '../IntroContainer/IntroContainer';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';

interface PreJoinScreensProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
  setMediaError?(error: Error): void;
  dispatchUpdate: (update: CoveyAppUpdate) => void;
}

export default function PreJoinScreens({
  doLogin,
  setMediaError,
  dispatchUpdate,
}: PreJoinScreensProps): JSX.Element {
  return (
    <IntroContainer dispatchUpdate={dispatchUpdate} doLogin={doLogin}>
      <Heading as='h2' size='xl'>
        Welcome to Covey.Town!
      </Heading>
      <Text p='4'>
        Covey.Town is a social platform that integrates a 2D game-like metaphor with video chat. To
        get started, setup your camera and microphone, choose a username, and then create a new town
        to hang out in, or join an existing one.
      </Text>
      <DeviceSelectionScreen setMediaError={setMediaError} />
      <TownSelection doLogin={doLogin} />
    </IntroContainer>
  );
}

PreJoinScreens.defaultProps = {
  setMediaError: () => {},
};
