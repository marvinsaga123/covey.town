import React, { useCallback, useState } from 'react';

import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tbody,
  Td,
  Thead,
  Tr,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { Card, CardActions, CardContent, createStyles, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, InputBase, List, ListItem, ListItemSecondaryAction, TextField } from '@material-ui/core';
import { PhoneIcon, SearchIcon } from '@chakra-ui/icons';
import useCoveyAppState from '../../../../../../hooks/useCoveyAppState';
import { Friendship, SearchUsersResponse } from '../../../../../../classes/TownsServiceClient';

export default function SearchUsersButton(): JSX.Element {
  const [inputUserName, setInputUserName] = useState<string>('');
  const [fetchedUsers, setFetchedUsers] = useState<Friendship[]>([]);
  const [open, setOpen] = React.useState(false);
  const [pressed, setPressed] = React.useState<number[]>([]);
  const {friendsClient, userClient, userName} = useCoveyAppState();
  const toast = useToast()


  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setInputUserName('');
    setFetchedUsers([]);
    setPressed([])
  };

  const handleSearch = async (name: string) => {
    setInputUserName(name);

    if (name.length > 0) {
      try {
        await userClient
        .searchUsers({ userName: name, currUser: userName })
        .then(res => {
          if (res.listOfUsers.length > 0) {
            setFetchedUsers(res.listOfUsers);
          }
        }).catch(err => {
            throw err;
          });
      } catch (err) {
        toast({
          title: 'Unable to complete search',
          description: err.toString(),
          status: 'error',
        });
        return;
      }
    }
  }

  const handleAddFriend = async (name: string, index: number) => {
      try {
        await friendsClient
        .addFriend({ sender: userName, recipient: name })
        .then(res => {
          if (res.requestSentSuccess) {
            //disable button after friend request has been sent
            setPressed(prev => [...prev, index]);
          } else {
            toast({
              title: 'Unable to complete request',
              description: 'Error',
              status: 'error',
            });
          }
        }).catch(err => {
            throw err;
          });
      } catch (err) {
        toast({
          title: 'Unable to complete request',
          description: err.toString(),
          status: 'error',
        });
        return;
      }
  }

  return (
      <Button onClick={handleOpen} 
      bgColor="#5F2EEA" 
      color="white" 
      position="relative"
      right="0%"
      width="12vw"
      height="34px"
      borderRadius="40px">
        Search Users
      {open && 
                    <Dialog maxWidth="md" fullWidth={true} onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
                    <DialogTitle >Search Users</DialogTitle>
                    <DialogContent>
                    <InputGroup size="md">
                    <InputLeftElement
                      pointerEvents="none"
                      children={<SearchIcon color="gray.300" />}
                    />
                      <Input
                        type="search"
                        name='name'
                        placeholder='Username'
                        size="md"
                        focusBorderColor="purple.300"
                        value={inputUserName}
                        onChange={event => handleSearch(event.target.value)}
                      />
                      </InputGroup>
                    </DialogContent>
                    <List>
                      {
                        fetchedUsers.map((user, index) => {
                          if (user.friendship) {
                            return (
                              <ListItem>  
                                <Typography component="h2">
                                  {user.username}
                                </Typography>
                              </ListItem>
                          )} else {
                              if (pressed.includes(index)) {
                                return (
                                  <ListItem>  
                                    <Typography component="h1">
                                      {user.username}
                                    </Typography>
                                    <ListItemSecondaryAction>
                                  <Button disabled
                                                 colorScheme='purple'
                                                 color='white'
                                                 height="34px"
                                                 borderRadius="40px"
                                                 key={index}>
                                              Friend Request Sent!
                                            </Button>
                                            </ListItemSecondaryAction>
                                </ListItem>
                                )
                              } else {
                                return (
                                  <ListItem>  
                                    <Typography component="h2">
                                      {user.username}
                                    </Typography>
                                    <ListItemSecondaryAction>
                                      <Button key={index} type="submit" edge="end" 
                                      bgColor="#5F2EEA" 
                                      color="white" 
                                      position="relative"
                                      right="0%"
                                      width="12vw"
                                      height="34px"
                                      borderRadius="40px"
                                        onClick={() => handleAddFriend(user.username, index)}>
                                        Add Friend
                                      </Button>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                )}
                              }
                            })
                          }
                          </List>
                          </Dialog>
                        }
              </Button>

  )
}