/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/require-default-props */

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import Button from '@material-ui/core/Button';
import { Typography, Grid, Hidden } from '@material-ui/core';
import Menu from './Menu/Menu';

import TownSettings from '../../../../InitialLandingPage/TownSettings';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import LogOutButton from '../Buttons/LogOutButton/LogOutButton';
import FlipCameraButton from './FlipCameraButton/FlipCameraButton';
import ToggleScreenShareButton from '../Buttons/ToogleScreenShareButton/ToggleScreenShareButton';
import useCoveyAppState from '../../../../../hooks/useCoveyAppState';

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    backgroundColor: theme.palette.background.default,
    bottom: 20,
    left: 0,
    right: 0,
    // height: `${theme.footerHeight}px`,
    position: 'absolute',
    display: 'flex',
    padding: '0 1.43em',
    zIndex: 10,
    [theme.breakpoints.down('sm')]: {
      height: `${theme.mobileFooterHeight}px`,
      padding: 0,
    },
    border: "2px solid #5F2EEA",
  },
  item: {
    borderRight: "2px solid #5F2EEA",
    borderLeft: "2px solid #5F2EEA"
  },
  screenShareBanner: {
    'position': 'absolute',
    'zIndex': 10,
    'bottom': `${theme.footerHeight}px`,
    'left': 0,
    'right': 0,
    'height': '104px',
    'background': 'rgba(0, 0, 0, 0.5)',
    '& h6': {
      color: 'white',
    },
    '& button': {
      'background': 'white',
      'color': theme.brand,
      'border': `2px solid ${theme.brand}`,
      'margin': '0 2em',
      '&:hover': {
        color: '#600101',
        border: '2px solid #600101',
        background: '#FFE9E7',
      },
    },
  },
  hideMobile: {
    display: 'initial',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

export default function MenuBar(props: { setMediaError?(error: Error): void }): JSX.Element {
  const classes = useStyles();
  const { isSharingScreen, toggleScreenShare } = useVideoContext();
  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';
  const {userName} = useCoveyAppState();

  return (
    <>
      {isSharingScreen && (
        <Grid container justify='center' alignItems='center' className={classes.screenShareBanner}>
          <Typography variant='h6'>You are sharing your screen</Typography>
          <Button onClick={() => toggleScreenShare()}>Stop Sharing</Button>
        </Grid>
      )}
      <footer className={classes.container}>
        <Grid container justify='space-around' alignItems='center'>
          <Grid item>
            <Grid container justify='center'>
              <ToggleAudioButton disabled={isReconnecting} setMediaError={props.setMediaError} />
              <ToggleVideoButton disabled={isReconnecting} setMediaError={props.setMediaError} />
              <Hidden smDown>
                {!isSharingScreen && <ToggleScreenShareButton disabled={isReconnecting} />}
              </Hidden>
              <FlipCameraButton />
            </Grid>
          </Grid>
          <Hidden smDown>

          <Grid item className={classes.item}>
            <p>&nbsp;&nbsp; Logged in as <b> [ {userName} ] </b> &nbsp;&nbsp;</p>
          </Grid>

          <Grid item>
              <Grid container justify="flex-end">
                <TownSettings />
                <Menu />
                &nbsp;&nbsp;&nbsp;
                <EndCallButton />
                &nbsp;&nbsp;&nbsp;
                <LogOutButton />
              </Grid>
          </Grid>

          </Hidden>
        </Grid>
      </footer>
    </>
  );
}
