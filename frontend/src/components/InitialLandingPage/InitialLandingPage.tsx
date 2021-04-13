import React, { useState } from 'react';
import { TownJoinResponse } from '../../classes/TownsServiceClient';
import { CoveyAppUpdate } from '../../CoveyTypes';
import MediaErrorSnackbar from '../VideoCall/VideoFrontend/components/PreJoinScreens/MediaErrorSnackbar/MediaErrorSnackbar';
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';

interface InitialLandingPageProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
  dispatchUpdate: (update: CoveyAppUpdate) => void;
}

export default function InitialLandingPage({
  doLogin,
  dispatchUpdate,
}: InitialLandingPageProps): JSX.Element {
  const [mediaError, setMediaError] = useState<Error>();

  return (
    <>
      <MediaErrorSnackbar error={mediaError} dismissError={() => setMediaError(undefined)} />
      <PreJoinScreens
        doLogin={doLogin}
        setMediaError={setMediaError}
        dispatchUpdate={dispatchUpdate}
      />
    </>
  );
}
