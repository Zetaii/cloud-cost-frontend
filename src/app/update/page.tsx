"use client"

import { useState, useEffect } from "react"
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Container,
  Flex,
} from "@chakra-ui/react"
import Layout from "../components/Layout"

interface ServiceUsage {
  labels: string[]
  data: number[]
}

interface CloudCost {
  month: string
  cost: number
}

const UpdatePage = () => {
  const [cloudCosts, setCloudCosts] = useState<CloudCost[]>([])
  const [serviceUsage, setServiceUsage] = useState<ServiceUsage>({
    labels: [],
    data: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const toast = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [costsResponse, usageResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/cloud-costs"),
          fetch("http://127.0.0.1:8000/service-usage"),
        ])

        if (!costsResponse.ok) throw new Error("Failed to fetch cloud costs")
        if (!usageResponse.ok) throw new Error("Failed to fetch service usage")

        const [costsData, usageData] = await Promise.all([
          costsResponse.json(),
          usageResponse.json(),
        ])

        setServiceUsage(usageData)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred"
        setError(errorMessage)
        toast({
          title: "Error fetching data",
          description: errorMessage,
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleCloudCostChange = (
    index: number,
    field: keyof CloudCost,
    value: string
  ) => {
    setCloudCosts((prevCosts) => {
      const newCosts = [...prevCosts]
      if (field === "cost") {
        newCosts[index][field] = parseFloat(value)
      } else {
        newCosts[index][field] = value
      }
      return newCosts
    })
  }

  const handleServiceUsageChange = (index: number, value: string) => {
    const newData = [...serviceUsage.data]
    newData[index] = parseFloat(value)
    setServiceUsage({ ...serviceUsage, data: newData })
  }

  const updateData = async (
    url: string,
    data: any,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        toast({
          title: successMessage,
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error(errorMessage)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const updateCloudCosts = () =>
    updateData(
      "http://127.0.0.1:8000/update-cloud-costs",
      cloudCosts,
      "Cloud costs updated successfully",
      "Failed to update cloud costs"
    )

  const updateServiceUsage = () =>
    updateData(
      "http://127.0.0.1:8000/update-service-usage",
      serviceUsage,
      "Service usage updated successfully",
      "Failed to update service usage"
    )

  if (isLoading) return <Spinner />
  if (error) return <Text>Error: {error}</Text>

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Text fontSize="3xl" mb={8} fontWeight="bold" textAlign="center">
          Update Data
        </Text>

        <VStack align="stretch" spacing={12}>
          <Box bg="white" shadow="lg" borderRadius="xl" p={8}>
            <Text fontSize="2xl" mb={6} fontWeight="semibold">
              Cloud Costs
            </Text>
            <Table variant="simple" borderWidth="1px" borderColor="gray.200">
              <Thead bg="gray.50">
                <Tr>
                  <Th
                    borderWidth="1px"
                    borderColor="gray.200"
                    width="50%"
                    textAlign="center"
                  >
                    Month
                  </Th>
                  <Th
                    borderWidth="1px"
                    borderColor="gray.200"
                    width="50%"
                    textAlign="center"
                  >
                    Cost
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {cloudCosts.map((cost, index) => (
                  <Tr key={index}>
                    <Td borderWidth="1px" borderColor="gray.200">
                      <VStack spacing={2}>
                        <Input
                          value={cost.month}
                          onChange={(e) =>
                            handleCloudCostChange(
                              index,
                              "month",
                              e.target.value
                            )
                          }
                          borderWidth="1px"
                          textAlign="center"
                        />
                      </VStack>
                    </Td>
                    <Td borderWidth="1px" borderColor="gray.200">
                      <VStack spacing={2}>
                        <Input
                          type="number"
                          value={cost.cost}
                          onChange={(e) =>
                            handleCloudCostChange(index, "cost", e.target.value)
                          }
                          borderWidth="1px"
                          textAlign="center"
                        />
                      </VStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Flex justifyContent="flex-end" mt={6}>
              <Button onClick={updateCloudCosts} colorScheme="blue" size="lg">
                Update Cloud Costs
              </Button>
            </Flex>
          </Box>

          <Box bg="white" shadow="lg" borderRadius="xl" p={8}>
            <Text fontSize="2xl" mb={6} fontWeight="semibold">
              Service Usage
            </Text>
            <Table variant="simple" borderWidth="1px" borderColor="gray.200">
              <Thead bg="gray.50">
                <Tr>
                  <Th
                    borderWidth="1px"
                    borderColor="gray.200"
                    width="50%"
                    textAlign="center"
                  >
                    Service
                  </Th>
                  <Th
                    borderWidth="1px"
                    borderColor="gray.200"
                    width="50%"
                    textAlign="center"
                  >
                    Usage
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {serviceUsage.labels.map((label, index) => (
                  <Tr key={index}>
                    <Td borderWidth="1px" borderColor="gray.200">
                      <Text textAlign="center">{label}</Text>
                    </Td>
                    <Td borderWidth="1px" borderColor="gray.200">
                      <VStack spacing={2}>
                        <Input
                          type="number"
                          value={serviceUsage.data[index]}
                          onChange={(e) =>
                            handleServiceUsageChange(index, e.target.value)
                          }
                          borderWidth="1px"
                          textAlign="center"
                        />
                      </VStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Flex justifyContent="flex-end" mt={6}>
              <Button onClick={updateServiceUsage} colorScheme="blue" size="lg">
                Update Service Usage
              </Button>
            </Flex>
          </Box>
        </VStack>
      </Container>
    </Layout>
  )
}

export default UpdatePage
