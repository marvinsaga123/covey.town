import { Button, HStack, StackDivider, VStack } from '@chakra-ui/react';
import { makeStyles, Theme } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import React from 'react';
import { CoveyAppUpdate } from '../../../../../CoveyTypes';
import useCoveyAppState from '../../../../../hooks/useCoveyAppState';
import FriendsInfoButton from '../Buttons/FriendsInfoButton/FriendsInfoButton';
import SearchUsersButton from '../Buttons/SearchUsersButton/SearchUsersButton';

const useStyles = makeStyles((theme: Theme) => ({
  background: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  container: {
    position: 'relative',
    flex: '1',
  },
  innerContainer: {
    display: 'block',
    height: 'auto',
    width: 'calc(100% - 40px)',
    margin: '10px auto',
    maxWidth: '700px',

    borderRadius: '8px',
    border: '1px solid #5F2EEA',
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    background: 'white',
    width: '100%',
    padding: '2em',
    flex: 1,
  },
  subContentContainer: {
    marginTop: '1em',
    width: '100%',
  },
}));

interface IntroContainerProps {
  children: React.ReactNode;
  subContent?: React.ReactNode;
  dispatchUpdate: (update: CoveyAppUpdate) => void;
}

const IntroContainer = ({
  children,
  subContent,
  dispatchUpdate,
}: IntroContainerProps): JSX.Element => {
  const { userName: appStateUserName } = useCoveyAppState();
  const classes = useStyles();

  return (
    <div className={classes.background}>
      <div className={classes.container}>
        <div className={classes.innerContainer}>
          <HStack borderBottomWidth='1px'
            borderBottomColor='#5F2EEA'
            justify='space-between'
            paddingRight='2em'
            paddingLeft='2em'
            paddingTop='0.5em'
            paddingBottom='0.5em'
            marginBottom={3}>
          <VStack>
            <p>
              Logged in as <b>{appStateUserName}</b>
            </p>
            <Button
              backgroundColor='#5F2EEA'
              color='white'
              height="34px"
              width='10vw'
              borderRadius="40px"
              data-testid='RegisterButton'
              onClick={() => {
                dispatchUpdate({
                  action: 'logout',
                  data: {
                    isLoggedIn: false,
                    userName: '',
                  },
                });
              }}>
              Logout
            </Button>
            </VStack>
            <VStack spacing={2}>   
              <SearchUsersButton></SearchUsersButton>
              <FriendsInfoButton></FriendsInfoButton>
            </VStack>            
          </HStack>

          <div className={classes.content}>{children}</div>
        </div>
        {subContent && <div className={classes.subContentContainer}>{subContent}</div>}
      </div>
    </div>
  );
};

IntroContainer.defaultProps = {
  subContent: null,
};

export default IntroContainer;
