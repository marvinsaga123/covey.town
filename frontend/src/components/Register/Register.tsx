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

interface InitialRegisterPageProps {
  dispatchUpdate: (update: CoveyAppUpdate) => void;
}

export default function Register({ dispatchUpdate }: InitialRegisterPageProps): JSX.Element {
  const [show, setShow] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const handleShow = () => setShow(!show);
  const handleShowConfirmation = () => setShowConfirmation(!showConfirmation);
  const toast = useToast();
  const [userId, setUserID] = useState<string>();
  const [userPassword, setUserPassword] = useState<string>();
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const { apiClient } = useCoveyAppState();

  const passwordIsValid = async () => {
    if (!userPassword || userPassword.length < 8) {
      return false;
    }
    let capital = false;
    let number = false;
    let specialCharacter = false;
    for (let index = 0; index < userPassword.length; index += 1) {
      const num = userPassword.charAt(index);
      if (num >= '0' && num <= '9') {
        number = true;
      } else if (num >= 'A' && num <= 'Z') {
        capital = true;
      } else if (
        (num >= '!' && num <= '/') ||
        (num >= ':' && num <= '@') ||
        (num >= '[' && num <= '`') ||
        num >= '{' ||
        num <= '~'
      ) {
        specialCharacter = true;
      }
    }
    if (capital && number && specialCharacter) {
      return true;
    }
    return false;
  };

  const handleRegister = async () => {
    try {
      if (!userId || !userPassword || !confirmPassword) {
        toast({
          title: 'Required Fields Missing',
          description: 'The username, password, and password confirmation need to be filled.',
          status: 'error',
          isClosable: true,
          duration: 3000,
        });
        return;
      }
      const valid = await passwordIsValid();
      if (!valid) {
        toast({
          title: 'Password Invalid',
          description:
            'Password needs to have at least one capital letter, ' +
            'one number, and a special character (!@#$% etc...) ' +
            'with a minimum password length of 8.',
          status: 'error',
          isClosable: true,
          duration: 6000,
        });
      } else if (userPassword !== confirmPassword) {
        toast({
          title: 'Passwords Do Not Match',
          description:
            'Password confirmation does not match the original password typed in, please try again.',
          status: 'error',
          isClosable: true,
          duration: 3000,
        });
      } else {
        await apiClient
          .register({ userName: userId, password: userPassword })
          .then(res => {
            if (res.registerSuccessfully) {
              toast({
                title: 'User Registered',
                description: 'Successfullty created an account!',
                status: 'success',
                isClosable: true,
                duration: 3000,
              });
              dispatchUpdate({
                action: 'finishRegistration',
                data: {
                  isRegistering: false,
                },
              });
            } else {
              throw Error(res.errorMessage);
            }
          })
          .catch(err => {
            throw err;
          });
      }
    } catch (err) {
      toast({
        description: err.toString(),
        status: 'error',
        isClosable: true,
        duration: 3000,
      });
    }
  };

  const handleAccountExists = () => {
    dispatchUpdate({
      action: 'register',
      data: {
        isRegistering: false,
      },
    });
  };

  return (
    <Flex align='center' justify='center' height='100vh'>
      <VStack spacing='2.5vh'>
        <Center height='10vh' width='60vw' borderWidth='1px' centerContent borderColor='#5F2EEA'>
          <Text as='kbd' fontSize='30px'>
            Create an Account
          </Text>
        </Center>

        <HStack width='60vw'>
          <Icon as={BiUser} w={6} h={6} />
          <FormControl>
            <Input
              autoFocus
              name='name'
              placeholder='Create a Username'
              value={userId}
              onChange={event => setUserID(event.target.value)}
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
              placeholder='Create a Password'
              value={userPassword}
              onChange={event => setUserPassword(event.target.value)}
              focusBorderColor='#5F2EEA'
            />
          </FormControl>
          <Button onClick={handleShow}>{show ? 'Hide' : 'Show'}</Button>
        </HStack>

        <HStack width='60vw'>
          <Icon as={LockIcon} w={6} h={6} />
          <FormControl>
            <Input
              type={showConfirmation ? 'text' : 'password'}
              autoFocus
              name='confirmPassword'
              placeholder='Confirm Password'
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              focusBorderColor='#5F2EEA'
            />
          </FormControl>
          <Button onClick={handleShowConfirmation}>{showConfirmation ? 'Hide' : 'Show'}</Button>
        </HStack>

        <Button
          backgroundColor='#5F2EEA'
          color='white'
          as='kbd'
          width='20vw'
          data-testid='RegisterButton'
          onClick={handleRegister}>
          Register
        </Button>

        <Button
          backgroundColor='white'
          color='#5F2EEA'
          borderColor='#5F2EEA'
          borderWidth='1px'
          as='kbd'
          width='20vw'
          data-testid='AccountExistsButton'
          onClick={handleAccountExists}>
          Already have an account?
        </Button>
      </VStack>
    </Flex>
  );
}
