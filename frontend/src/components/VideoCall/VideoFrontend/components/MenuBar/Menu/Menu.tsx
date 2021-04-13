import { Theme, useMediaQuery } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import React, { useRef, useState } from 'react';
import DeviceSelectionDialog from '../../DeviceSelectionDialog/DeviceSelectionDialog';

interface MenuProps {
  buttonClassName?: string;
}

export default function Menu({ buttonClassName }: MenuProps): JSX.Element {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <MenuItem onClick={() => setSettingsOpen(true)}>
        <Typography variant='body1'>A/V Settings</Typography>
      </MenuItem>
      <DeviceSelectionDialog
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setMenuOpen(false);
        }}
      />
    </>
  );
}

Menu.defaultProps = {
  buttonClassName: '',
};
