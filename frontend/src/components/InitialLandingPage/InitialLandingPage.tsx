import React, { useState } from 'react';
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';
import MediaErrorSnackbar
  from '../VideoCall/VideoFrontend/components/PreJoinScreens/MediaErrorSnackbar/MediaErrorSnackbar';
import { TownJoinResponse } from '../../classes/TownsServiceClient';

interface InitialLandingPageProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function InitialLandingPage({ doLogin }: InitialLandingPageProps): JSX.Element {
  const [mediaError, setMediaError] = useState<Error>();

  return (
    <>
      <MediaErrorSnackbar error={mediaError} dismissError={() => setMediaError(undefined)} />
      <PreJoinScreens
        doLogin={doLogin}
        setMediaError={setMediaError}
      />
    </>
  );
}
