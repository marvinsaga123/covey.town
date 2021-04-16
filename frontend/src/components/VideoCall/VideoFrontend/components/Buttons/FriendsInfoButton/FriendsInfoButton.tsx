import React, { useCallback, useState } from 'react';

import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tbody,
  Td,
  Thead,
  Tr,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { Card, CardActions, CardContent, createStyles, Dialog, DialogContent, DialogTitle, Icon, IconButton, InputAdornment, InputBase, InputLabel, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListSubheader, Menu, TextField } from '@material-ui/core';
import { SearchIcon } from '@chakra-ui/icons';
import useCoveyAppState from '../../../../../../hooks/useCoveyAppState';
import { Friend, Friendship, SearchUsersResponse } from '../../../../../../classes/TownsServiceClient';
import { makeStyles, Theme } from '@material-ui/core';
import { IndeterminateCheckBoxOutlined, Search } from '@material-ui/icons';
import { indexBy } from 'ramda';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import Video from '../../../../../../classes/Video/Video';

// interface TownSelectionProps {
//   doLogin: (initData: TownJoinResponse) => Promise<boolean>;
// }

export default function FriendsInfoButton(): JSX.Element {
  const [fetchedUsers, setFetchedUsers] = useState<Friend[]>([]);
  const [open, setOpen] = React.useState<boolean>(false);
  const [menuType, setMenuType] = React.useState<string>('');
  const [removedFriend, setRemovedFriend] = React.useState<number[]>([]);
  const [respondedRequest, setRespondedRequest] = React.useState<number[]>([]);
  const [cancelledRequest, setCancelledRequest] = React.useState<number[]>([]);
  const {apiClient, userName, myPlayerID} = useCoveyAppState();
  const toast = useToast()

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFetchedUsers([]);
    setRemovedFriend([]);
    setMenuType("");
    setCancelledRequest([]);
    setRespondedRequest([]);
  };

  const handleMenuChange = async (menu: string) => {
    setMenuType(menu);
    setFetchedUsers([]);
    setRemovedFriend([]);
    setCancelledRequest([]);
    setRespondedRequest([]);
    try {
      if (menu === 'friendsList') {
        await apiClient
        .processFriendsListAction({ action: 'getCurrentListOfFriends', forUser: userName })
        .then(res => {
          if (res.listOfUsers) {
            setFetchedUsers(res.listOfUsers);
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
      }
      if (menu === 'pending') {
        await apiClient
        .processFriendsListAction({ action: 'getPendingFriendRequests', forUser: userName })
        .then(res => {
          if (res.listOfUsers) {
            setFetchedUsers(res.listOfUsers);
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
      }
    } catch (err) {
      toast({
        title: 'Unable to complete search',
        description: err.toString(),
        status: 'error',
      });
      return;
    }
  };

  const handleRemoveFriend = async (friend: string, index: number) => {
    try {
        await apiClient
        .removeFriend({ friend: friend, user: userName })
        .then(res => {
          //remove friend buttons
          setRemovedFriend(prev => [...prev, index]);
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
  };

  const handleFriendRequest = async (sender: string, recipient: string, index: number, action: string) => {
    try {
        await apiClient
        .processFriendRequestAction({ action: action, friendRequestSender: sender, friendRequestRecipient: recipient })
        .then(res => {
          if (res.requestSentSuccess) {
            //remove accept/deny buttons
            setRespondedRequest(prev => [...prev, index]);
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
        title: 'Unable to complete search',
        description: err.toString(),
        status: 'error',
      });
      return;
    }
  };

  const handleCancelRequest = async (sender: string, recipient: string, index: number) => {
    try {
        await apiClient
        .cancelFriendRequest({action: 'cancel', friendRequestSender: sender, friendRequestRecipient: recipient })
        .then(res => {
          if (res.requestSentSuccess) {
            //remove cancel button
            setCancelledRequest(prev => [...prev, index]);
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
        title: 'Unable to complete search',
        description: err.toString(),
        status: 'error',
      });
      return;
    }
  };
  // const handleJoin = useCallback(
  //   async (coveyRoomID: string) => {
  //     try {
  //       if (!coveyRoomID || coveyRoomID.length === 0) {
  //         toast({
  //           title: 'Unable to join town',
  //           description: 'Please enter a town ID',
  //           status: 'error',
  //         });
  //         return;
  //       }
  //       const initData = await Video.setup(userName, coveyRoomID);

  //       const loggedIn = await doLogin(initData);
  //       if (loggedIn) {
  //         assert(initData.providerVideoToken);
  //         await connect(initData.providerVideoToken);
  //       }
  //     } catch (err) {
  //       toast({
  //         title: 'Unable to connect to Towns Service',
  //         description: err.toString(),
  //         status: 'error',
  //       });
  //     }
  //   },
  //   [doLogin, userName, connect, toast],
  // );

  return (
      <Button onClick={handleOpen} 
      bgColor="#5F2EEA" 
      color="white" 
      position="relative"
      right="0%"
      width="12vw"
      height="34px"
      borderRadius="40px">
        View Friends Info
      {open && 
                    <Dialog maxWidth="md" fullWidth={true} onClose={handleClose} aria-labelledby="form-dialog-title" open={open}>
                    <DialogTitle>Friends Info</DialogTitle>
                    <DialogContent>
                      <FormControl variant="outlined">
                        <Select placeholder="Select info"
                         focusBorderColor="purple.300"
                          value={menuType}
                          label="Menu"
                          onChange={event => handleMenuChange(event.target.value)}
                        >
                          <option value=""></option>
                          <option value={"friendsList"}>Friends List</option>
                          <option value={"pending"}>Friend Requests</option>=
                        </Select>
                      </FormControl>
                      {menuType == "friendsList" && 
                        <List>
                        {
                          fetchedUsers.map((user, index) => {
                            if (user.online && user.username != userName) {
                              if (removedFriend.includes(index)) {
                                return (
                                  <ListItem>  
                                  <ListItemIcon>
                                    <FiberManualRecordIcon htmlColor="green"/>
                                    </ListItemIcon>                                     
                                    <Typography component="h2">
                                    {user.username}
                                  </Typography>
                                  <Typography component="h2">
                                  Friend Removed!
                                </Typography>
                                </ListItem>
                                )
                              } else if (user.room) {
                                return (
                                  <ListItem>  
                                    <ListItemIcon>
                                      <FiberManualRecordIcon htmlColor="green"/>
                                      </ListItemIcon>                                     
                                       <Typography component="h2">
                                      {user.username}
                                    </Typography>
                                    <ListItemSecondaryAction>
                                            <Button key={index} type="submit" edge="end"
                                                 colorScheme='purple'
                                                 height="34px"
                                                 width='12vw'
                                                 borderRadius="40px">
                                              Join Room&nbsp;<b>[ {user.room} ] </b> 
                                            </Button>
                                            &nbsp;&nbsp;
                                            <Button type="submit" edge="end"
                                                 colorScheme='red'
                                                 color='white'
                                                 height="34px"
                                                 width='10vw'
                                                 borderRadius="40px"
                                                 key={index}
                                                 onClick={() => handleRemoveFriend(user.username, index)}>
                                              Remove Friend
                                            </Button>
                                          </ListItemSecondaryAction>
                                  </ListItem>
                                )
                              } else {
                                  return (
                                    <ListItem>  
                                      <ListItemIcon>
                                        <FiberManualRecordIcon htmlColor="green"/>
                                        </ListItemIcon>                                     
                                        <Typography component="h2">
                                        {user.username}
                                      </Typography>
                                      <ListItemSecondaryAction>
                                                <Button type="submit" edge="end"           
                                                colorScheme='red'
                                                color='white'
                                                  height="34px"
                                                  width='10vw'
                                                  borderRadius="40px"
                                                  onClick={() => handleRemoveFriend(user.username, index)}>
                                                  Remove Friend
                                                </Button>
                                              </ListItemSecondaryAction>
                                    </ListItem>
                                  )
                                }
                          } else if (user.username != userName)  {
                            if (removedFriend.includes(index)) {
                              return (
                                <ListItem>  
                                <ListItemIcon>
                                  <FiberManualRecordIcon htmlColor="red"/>
                                  </ListItemIcon>                                     
                                  <Typography component="h2">
                                  {user.username}
                                </Typography>
                                &nbsp;&nbsp;
                                <Typography component="h2">
                                Friend Removed!
                              </Typography>
                              </ListItem>
                              )
                            } else {
                            return (
                              <ListItem>  
                                <ListItemIcon>
                                  <FiberManualRecordIcon htmlColor="red"/>
                                  </ListItemIcon>                                     
                                   <Typography component="h2">
                                  {user.username}
                                </Typography>
                                <ListItemSecondaryAction>
                                            <Button type="submit" edge="end"
                                                       colorScheme='red'
                                                       color='white'
                                                       height="34px"
                                                       width='10vw'
                                                       borderRadius="40px"
                                                       onClick={() => handleRemoveFriend(user.username, index)}>
                                              Remove Friend
                                            </Button>
                                          </ListItemSecondaryAction>
                              </ListItem>
                            )
                          }
                        }
                        })}
                    </List>
                  }
                  {menuType == "pending" && 
                        <List>
                        {
                          fetchedUsers.map((user, index) => {
                            if (user.requestSender != userName && user.username != userName) { //requests
                              if (respondedRequest.includes(index)) {
                                return (
                                  <ListItem>                                    
                                    <Typography component="h2">
                                    {user.username}
                                  </Typography>
                                  <Typography component="h2">
                                  Confirmed!
                                </Typography>
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
                                                 colorScheme='green'
                                                 color='white'
                                                 height="34px"
                                                 width='10vw'
                                                 onClick={() => handleFriendRequest(user.requestSender, user.requestRecipient, index, 'accept')}
                                                 borderRadius="40px">
                                              Accept
                                            </Button>
                                            &nbsp;&nbsp;
                                            <Button type="submit" edge="end"
                                                 colorScheme='red'
                                                 color='white'
                                                 height="34px"
                                                 width='10vw'
                                                 borderRadius="40px"
                                                 key={index}
                                                 onClick={() => handleFriendRequest(user.requestSender, user.requestRecipient, index, 'accept')}>
                                              Deny
                                            </Button>
                                          </ListItemSecondaryAction>
                                  </ListItem>
                                )
                              }
                             } else if (user.requestSender === userName && user.username != userName) {
                              if (cancelledRequest.includes(index)) {
                                return (
                                  <ListItem>                                    
                                    <Typography component="h2">
                                    {user.username}
                                  </Typography>
                                  <Typography component="h2">
                                  Friend Request Cancelled!
                                </Typography>
                                </ListItem>
                                )
                              } else {
                                  return (
                                    <ListItem>  
                                        <Typography component="h2">
                                        {user.username}
                                      </Typography>
                                      <ListItemSecondaryAction>
                                                <Button type="submit" edge="end"           
                                                colorScheme='red'
                                                color='white'
                                                  height="34px"
                                                  width='10vw'
                                                  borderRadius="40px"
                                                  onClick={() => handleCancelRequest(user.requestSender, user.requestRecipient, index)}>
                                                  Cancel
                                                </Button>
                                              </ListItemSecondaryAction>
                                    </ListItem>
                                  )
                                  }
                                }
                        })}
                    </List>
                  }
              </DialogContent>
              </Dialog>
              }
              </Button>

  )
}