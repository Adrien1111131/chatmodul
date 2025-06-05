import { Box, VStack, Avatar, Text, Flex } from '@chakra-ui/react'

const ContactList = ({ contacts, selectedContact, onSelectContact }) => {
  return (
    <Box w="250px" h="100%" bg="white" borderRight="1px" borderColor="gray.200">
      <VStack spacing={0} align="stretch">
        {contacts.map((contact) => (
          <Flex
            key={contact.id}
            p={4}
            cursor="pointer"
            bg={selectedContact?.id === contact.id ? 'blue.50' : 'transparent'}
            _hover={{ bg: 'gray.50' }}
            onClick={() => onSelectContact(contact)}
            align="center"
            borderBottom="1px"
            borderColor="gray.100"
          >
            <Avatar
              name={contact.name}
              src={contact.avatar}
              size="md"
              mr={3}
            />
            <Box>
              <Text fontWeight="bold">{contact.name}</Text>
              <Text fontSize="sm" color="gray.500">
                {contact.status}
              </Text>
            </Box>
          </Flex>
        ))}
      </VStack>
    </Box>
  )
}

export default ContactList 