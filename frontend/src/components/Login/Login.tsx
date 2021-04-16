import { LockIcon } from '@chakra-ui/icons';
import {
  Button,
  Center,
  Flex,
  FormControl,
  HStack,
  Icon,
  Input,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { BiUser } from 'react-icons/bi';
import { CoveyAppUpdate } from '../../CoveyTypes';
import useCoveyAppState from '../../hooks/useCoveyAppState';

interface InitialLoginPageProps {
  dispatchUpdate: (update: CoveyAppUpdate) => void;
}

export default function Login({ dispatchUpdate }: InitialLoginPageProps): JSX.Element {
  const [show, setShow] = useState<boolean>(false);
  const [userPassword, setUserPassword] = useState<string>();
  const [userName, setUserName] = useState<string>();
  const toast = useToast();
  const { userClient } = useCoveyAppState();

  const handleShow = () => setShow(!show);

  const handleLogin = async () => {
    if (!userName || userName.length === 0) {
      toast({
        title: 'Username is Required',
        description: 'Please enter your username.',
        status: 'error',
      });

      return;
    }

    if (!userPassword || userPassword.length === 0) {
      toast({
        title: 'Password is Required',
        description: 'Please enter your password.',
        status: 'error',
      });

      return;
    }

    try {
      await userClient
        .login({ userName, password: userPassword })
        .then(res => {
          if (res.loggedInSuccessfully) {
            dispatchUpdate({
              action: 'loggedIn',
              data: {
                isLoggedIn: true,
                userName,
              },
            });
          } else {
            toast({
              title: 'Login Failed',
              description: 'Username and password combination is incorrect. Please try again.',
              status: 'error',
            });
          }
        })
        .catch(err => {
          throw err;
        });
    } catch (err) {
      toast({
        description: err.toString(),
        status: 'error',
      });
    }
  };

  const handleRegister = () => {
    dispatchUpdate({
      action: 'register',
      data: {
        isRegistering: true,
      },
    });
  };

  return (
    <Flex align='center' justify='center' height='100vh'>
      <VStack spacing='2.5vh'>
        <Center height='10vh' width='60vw' borderWidth='1px' centerContent borderColor='#5F2EEA'>
          <Text as='kbd' fontSize='30px'>
            Welcome to Covey.Town
          </Text>
        </Center>

        <HStack width='60vw'>
          <Icon as={BiUser} w={6} h={6} />
          <FormControl>
            <Input
              autoFocus
              name='name'
              placeholder='Username'
              value={userName}
              onChange={event => setUserName(event.target.value)}
              focusBorderColor='#5F2EEA'
            />
          </FormControl>
        </HStack>

        <HStack width='60vw'>
          <Icon as={LockIcon} w={6} h={6} />
          <FormControl>
            <Input
              type={show ? 'text' : 'password'}
              autoFocus
              name='password'
              placeholder='Password'
              value={userPassword}
              onChange={event => setUserPassword(event.target.value)}
              focusBorderColor='#5F2EEA'
            />
          </FormControl>
          <Button onClick={handleShow}>{show ? 'Hide' : 'Show'}</Button>
        </HStack>

        <Button
          backgroundColor='#5F2EEA'
          color='white'
          as='kbd'
          width='20vw'
          data-testid='LoginButton'
          onClick={() => handleLogin()}>
          Login
        </Button>

        <Button
          backgroundColor='white'
          color='#5F2EEA'
          borderColor='#5F2EEA'
          borderWidth='1px'
          as='kbd'
          width='20vw'
          data-testid='RegisterButton'
          onClick={() => handleRegister()}>
          Register
        </Button>
      </VStack>
    </Flex>
  );
}
