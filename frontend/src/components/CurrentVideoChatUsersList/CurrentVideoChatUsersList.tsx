import { Box, Center, Text } from '@chakra-ui/react';
import React from 'react';
import useNearbyPlayers from '../../hooks/useNearbyPlayers';

export default function CurrentVideoChatUsersList(): JSX.Element {
  const { nearbyPlayers } = useNearbyPlayers();

  return (
    <Box
      flex={1}
      centerContent
      height='50vh'
      overflowY='scroll'
      borderBottomWidth='1px'
      borderLeftWidth='2px'
      borderLeftColor='#5F2EEA'
      borderRightWidth='2px'
      borderRightColor='#5F2EEA'>
      <Center borderTopWidth='2px' borderBottomWidth='2px' borderColor='#5F2EEA' padding='0.5em'>
        <Text fontWeight='bold'>Current Users in Video Chat</Text>
      </Center>
      {nearbyPlayers.map((player, i) => (
        <Center
          key={player.userName}
          centerContent
          borderBottomWidth={i === nearbyPlayers.length - 1 ? '2px' : '1px'}
          borderColor='#5F2EEA'
          padding='0.25em'>
          {player.userName}
        </Center>
      ))}
    </Box>
  );
}
