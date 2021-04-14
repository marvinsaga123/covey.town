import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import { CoveyAppUpdate } from '../../../../../../CoveyTypes';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

interface LogOutButtonProps {
  className?: string;
  dispatchUpdate: (update: CoveyAppUpdate) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      'background': '#5F2EEA',
      'color': 'white',
      '&:hover': {
        background: '#2c1470',
      },
      'borderRadius': 40,
      'height': 32,
      'width': 121,
    },
  }),
);

export default function LogOutButton({
  className,
  dispatchUpdate,
}: LogOutButtonProps): JSX.Element {
  const classes = useStyles();
  const { room } = useVideoContext();

  return (
    <Button
      onClick={() => {
        room.disconnect();
        dispatchUpdate({
          action: 'logout',
          data: {
            isLoggedIn: false,
            userName: '',
          },
        });
      }}
      className={clsx(classes.button, className)}
      data-cy-disconnect>
      Logout
    </Button>
  );
}

LogOutButton.defaultProps = {
  className: '',
};
