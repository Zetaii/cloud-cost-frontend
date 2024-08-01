import { ReactNode } from "react"
import { Box, Flex, Heading } from "@chakra-ui/react"
import Navbar from "./Navbar"

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => (
  <Box>
    <Navbar />
    <Box as="main" p={4} flex="1">
      {children}
    </Box>
  </Box>
)

export default Layout
