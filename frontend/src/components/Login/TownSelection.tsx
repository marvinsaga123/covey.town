

import React, { useCallback, useEffect, useState } from 'react';
import assert from "assert";
import { LockIcon } from '@chakra-ui/icons';
import { BiUser } from "react-icons/bi";
import {
  Avatar,
  AvatarBadge,
  AvatarGroup, 
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputRightElement,
  Icon,
  HStack,
  Stack,
  Table,
  Text,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import Video from '../../classes/Video/Video';
import { CoveyTownInfo, TownJoinResponse, } from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const [userName, setUserName] = useState<string>(Video.instance()?.userName || '');
  const [newTownName, setNewTownName] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const handleShow = () => setShow(!show);
  const handleShowConfirmation = () => setShowConfirmation(!showConfirmation);
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const toast = useToast();
  const [userId, setUserID] = useState<string>();
  const [userPassword, setUserPassword] = useState<string>();
  const [confirmPassword, setConfirmPassword] = useState<string>();

  const updateTownListings = useCallback(() => {
    // console.log(apiClient);
    apiClient.listTowns()
      .then((towns) => {
        setCurrentPublicTowns(towns.towns
          .sort((a, b) => b.currentOccupancy - a.currentOccupancy)
        );
      })
  }, [setCurrentPublicTowns, apiClient]);
  useEffect(() => {
    updateTownListings();
    const timer = setInterval(updateTownListings, 2000);
    return () => {
      clearInterval(timer)
    };
  }, [updateTownListings]);

  const handleJoin = useCallback(async (coveyRoomID: string) => {
    try {
      if (!userName || userName.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please select a username',
          status: 'error',
        });
        return;
      }
      if (!coveyRoomID || coveyRoomID.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please enter a town ID',
          status: 'error',
        });
        return;
      }
      const initData = await Video.setup(userName, coveyRoomID);

      const loggedIn = await doLogin(initData);
      if (loggedIn) {
        assert(initData.providerVideoToken);
        await connect(initData.providerVideoToken);
      }
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  }, [doLogin, userName, connect, toast]);

  const passwordIsValid = async () => { 
    if (!userPassword || userPassword.length < 8) {
      return false;
    }
    let capital = false;
    let number = false;
    let regularCharacter = false;
    let specialCharacter = false;
    for (let index = 0; index < userPassword.length; index+= 1) {
      const num = userPassword.charAt(index);
      if (num >= '0' && num <= '9') {
        number = true;
      }
      else if (num >= 'A' && num <= 'Z') {
        capital = true;
      }
      else if (num >= 'a' && num <= 'z') {
        regularCharacter = true;
      }
      else if ((num >= '!' && num <= '/') || (num >= ':' && num <= '@') || (num >= '[' && num <= '`') || (num >= '{' || num <= '~')) {
        specialCharacter = true; 
      } 
    } 
    if (capital && number && specialCharacter && regularCharacter) {
      return true;
    }
    return false;
  }

  const handleRegister = async () => {
    try {
      if (!userId || !userPassword || !confirmPassword) {
        toast({
          title: 'InfoNotFilled',
          description: 'The username, password, and password confirmation need to be filled',
          status: 'error',
          isClosable: true,
          duration: 3000,
        })
        return;
      }
      const valid = await passwordIsValid();
      if (!valid) {
        toast({
          title: 'Password Error',
          description: 'Password Invalid. there needs to be at least one capital letter,'
           + 'one number, and a special character(!@#$% etc...)' 
           + ' with minimum password length of 8',
           status: 'error',
           isClosable: true,
           duration: 3000,
        })
      }
      else if (userPassword !== confirmPassword) {
        toast({
          title: 'PasswordConfirm Error',
          description: "Password Confirmation does not match the Password typed in, try again.",
          status: 'error',
          isClosable: true,
          duration: 3000,
        })
      }
      
      // else if: TODO = make sure that account wasnt already created by checking the database



      else {
        // TODO = add userName and password to database
        toast({
          title: 'Registration Success',
          description: 'Successfullty created an Account',
          status: 'success',
          isClosable: true,
          duration: 3000,
        })
      }
    
    }
    catch (err) {
      toast({
        title: 'Error: ',
        description: err,
        status: 'error',
        isClosable: true,
        duration: 3000,
      })
    }
  }

  
  const handleCreate = async () => {
    if (!userName || userName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please select a username before creating a town',
        status: 'error',
      });
      return;
    }
    if (!newTownName || newTownName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please enter a town name',
        status: 'error',
      });
      return;
    }
    try {
      const newTownInfo = await apiClient.createTown({
        friendlyName: newTownName,
        isPubliclyListed: newTownIsPublic
      });
      let privateMessage = <></>;
      if (!newTownIsPublic) {
        privateMessage =
          <p>This town will NOT be publicly listed. To re-enter it, you will need to use this
            ID: {newTownInfo.coveyTownID}</p>;
      }
      toast({
        title: `Town ${newTownName} is ready to go!`,
        description: <>{privateMessage}Please record these values in case you need to change the
          room:<br/>Town ID: {newTownInfo.coveyTownID}<br/>Town Editing
          Password: {newTownInfo.coveyTownPassword}</>,
        status: 'success',
        isClosable: true,
        duration: null,
      })
      await handleJoin(newTownInfo.coveyTownID);
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  };
 
  // registration page
  return (
    <> 
      <form>
        <Stack>
           <Center boxShadow="outline" borderColor="black" p="6" rounded="md" bg="white" h="60px" color="Black">
            <Text as="kbd" fontSize="30px">Create an Account</Text>
          </Center>
          <HStack>
            <Icon as={BiUser} w={6} h={6} />
            <FormControl>
              <Input autoFocus name="name" placeholder="Create a Username"
                     value={userId}
                     onChange={event => setUserID(event.target.value)}/>
            </FormControl>
          </HStack>  

           <HStack>
            <Icon as={LockIcon} w={6} h={6} />
            <FormControl>
              
              <Input type={show ? "text" : "password"} autoFocus name="password" placeholder="Create a Password"
                     value={userPassword}
                     onChange={event => setUserPassword(event.target.value)}/>
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleShow}>
                 {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </FormControl>
          </HStack>  

          <HStack>
            <Icon as={LockIcon} w={6} h={6} />
            <FormControl>
              <Input type={showConfirmation ? "text" : "password"} autoFocus name="confirmPassword" placeholder="Confirm Password"
                     value={confirmPassword} 
                     onChange={event => setConfirmPassword(event.target.value)}/>
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleShowConfirmation}>
                 {showConfirmation ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </FormControl>
          </HStack>
          <Button data-testid="RegisterButton" onClick={handleRegister}>Register</Button>
        </Stack>


         
         <Stack>
          <Box p="4" borderWidth="1px" borderRadius="lg">
            <Heading as="h2" size="lg">Select a username</Heading>

            <FormControl>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input autoFocus name="name" placeholder="Your name"
                     value={userName}
                     onChange={event => setUserName(event.target.value)}
              />
            </FormControl>
          </Box>
          <Box borderWidth="1px" borderRadius="lg">
            <Heading p="4" as="h2" size="lg">Create a New Town</Heading>
            <Flex p="4">
              <Box flex="1">
                <FormControl>
                  <FormLabel htmlFor="townName">New Town Name</FormLabel>
                  <Input name="townName" placeholder="New Town Name"
                         value={newTownName}
                         onChange={event => setNewTownName(event.target.value)}
                  />
                </FormControl>
              </Box><Box>
              <FormControl>
                <FormLabel htmlFor="isPublic">Publicly Listed</FormLabel>
                <Checkbox id="isPublic" name="isPublic" isChecked={newTownIsPublic}
                          onChange={(e) => {
                            setNewTownIsPublic(e.target.checked)
                          }}/>
              </FormControl>
            </Box>
              <Box>
                <Button data-testid="newTownButton" onClick={handleCreate}>Create</Button>
              </Box>
            </Flex>
          </Box>
          <Heading p="4" as="h2" size="lg">-or-</Heading>

          <Box borderWidth="1px" borderRadius="lg">
            <Heading p="4" as="h2" size="lg">Join an Existing Town</Heading>
            <Box borderWidth="1px" borderRadius="lg">
              <Flex p="4"><FormControl>
                <FormLabel htmlFor="townIDToJoin">Town ID</FormLabel>
                <Input name="townIDToJoin" placeholder="ID of town to join, or select from list"
                       value={townIDToJoin}
                       onChange={event => setTownIDToJoin(event.target.value)}/>
              </FormControl>
                <Button data-testid='joinTownByIDButton'
                        onClick={() => handleJoin(townIDToJoin)}>Connect</Button>
              </Flex>

            </Box>

            <Heading p="4" as="h4" size="md">Select a public town to join</Heading>
            <Box maxH="500px" overflowY="scroll">
              <Table>
                <TableCaption placement="bottom">Publicly Listed Towns</TableCaption>
                <Thead><Tr><Th>Room Name</Th><Th>Room ID</Th><Th>Activity</Th></Tr></Thead>
                <Tbody>
                  {currentPublicTowns?.map((town) => (
                    <Tr key={town.coveyTownID}><Td role='cell'>{town.friendlyName}</Td><Td
                      role='cell'>{town.coveyTownID}</Td>
                      <Td role='cell'>{town.currentOccupancy}/{town.maximumOccupancy}
                        <Button onClick={() => handleJoin(town.coveyTownID)}
                                disabled={town.currentOccupancy >= town.maximumOccupancy}>Connect</Button></Td></Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
          
        </Stack>
            
      </form>
  </>
  );
}

