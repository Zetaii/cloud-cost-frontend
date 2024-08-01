import { Box, Flex, Text, Spacer } from "@chakra-ui/react"
import NextLink from "next/link"

const Navbar = () => {
  return (
    <Box bg="teal.500" p={4}>
      <Flex align="center">
        <Text color="white" fontSize="xl" mr={6}>
          My Cloud Dashboard
        </Text>
        <Flex>
          <NextLink href="/" passHref legacyBehavior>
            <Text as="a" color="white" mx={2}>
              Home
            </Text>
          </NextLink>
          <NextLink href="/update" passHref legacyBehavior>
            <Text as="a" color="white" mx={2}>
              Update
            </Text>
          </NextLink>
        </Flex>
        <Spacer />
      </Flex>
    </Box>
  )
}

export default Navbar
