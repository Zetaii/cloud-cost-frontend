"use client"

import { useState, useEffect } from "react"
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Button,
  Container,
} from "@chakra-ui/react"
import Layout from "../app/components/Layout"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface CloudCost {
  month: string
  cost: number
}

interface Resource {
  name: string
  type: string
  cost: number
}

const CustomInput = ({ value, onClick }: any) => (
  <Input value={value} onClick={onClick} readOnly cursor="pointer" size="md" />
)

const Dashboard = () => {
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  )
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [cloudCosts, setCloudCosts] = useState<CloudCost[]>([])
  const [serviceUsage, setServiceUsage] = useState({ labels: [], data: [] })
  const [dailyCosts, setDailyCosts] = useState({ labels: [], data: [] })
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [instanceCount, setInstanceCount] = useState(1)
  const [hoursPerDay, setHoursPerDay] = useState(24)
  const [daysPerMonth, setDaysPerMonth] = useState(30)
  const [costPerHour, setCostPerHour] = useState(0.1)
  const [estimatedCost, setEstimatedCost] = useState(0)

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date)
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [costsRes, serviceRes, dailyRes, resourcesRes] =
          await Promise.all([
            fetch("http://127.0.0.1:8000/cloud-costs"),
            fetch("http://127.0.0.1:8000/service-usage"),
            fetch("http://127.0.0.1:8000/daily-costs"),
            fetch("http://127.0.0.1:8000/resources"),
          ])

        const costs = await costsRes.json()
        const service = await serviceRes.json()
        const daily = await dailyRes.json()
        const resourcesData = await resourcesRes.json()

        setCloudCosts(costs)
        setServiceUsage(service)
        setDailyCosts(daily)
        setResources(resourcesData)
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError("An unknown error occurred")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // WebSocket connection
    const ws = new WebSocket("ws://127.0.0.1:8000/ws")

    ws.onopen = () => {
      console.log("WebSocket Connected")
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === "cloud_costs") {
        setCloudCosts(message.data)
      } else if (message.type === "service_usage") {
        setServiceUsage(message.data)
      }
      // Add more conditions if you have other types of real-time updates
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
    }

    return () => {
      ws.close()
    }
  }, [])

  const estimateCost = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/estimate-cost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceCount,
          hoursPerDay,
          daysPerMonth,
          costPerHour,
        }),
      })
      const data = await response.json()
      setEstimatedCost(data.estimatedMonthlyCost)
    } catch (e) {
      console.error("Error estimating cost:", e)
    }
  }

  const filterDataByDateRange = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/filtered-costs?start_date=${
          startDate.toISOString().split("T")[0]
        }&end_date=${endDate.toISOString().split("T")[0]}`
      )
      const filteredCosts = await response.json()
      setCloudCosts(filteredCosts)
    } catch (e) {
      console.error("Error filtering data:", e)
    }
  }

  const data = {
    labels: cloudCosts.map((cost) => cost.month),
    datasets: [
      {
        label: "Cloud Costs",
        data: cloudCosts.map((cost) => cost.cost),
        fill: false,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Cloud Costs",
      },
    },
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box bg="white" shadow="md" borderRadius="lg" p={6}>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>
              Date Range Selection
            </Text>
            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="space-between"
            >
              <Box mb={{ base: 4, md: 0 }} mr={{ md: 4 }}>
                <Text mb={2}>Start Date</Text>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                />
              </Box>
              <Box mb={{ base: 4, md: 0 }} mr={{ md: 4 }}>
                <Text mb={2}>End Date</Text>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                />
              </Box>
              <Button
                onClick={filterDataByDateRange}
                colorScheme="blue"
                size="lg"
              >
                Filter
              </Button>
            </Flex>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            <Box bg="white" shadow="md" borderRadius="lg" p={6}>
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                Monthly Cost Trend
              </Text>
              <Line data={data} options={options} />
            </Box>
            <Box bg="white" shadow="md" borderRadius="lg" p={6}>
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                Service Usage Breakdown
              </Text>
              <Doughnut
                data={{
                  labels: serviceUsage.labels,
                  datasets: [
                    {
                      data: serviceUsage.data,
                      backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
                        "#9966FF",
                      ],
                    },
                  ],
                }}
              />
            </Box>
            <Box bg="white" shadow="md" borderRadius="lg" p={6}>
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                Daily Cost Variation
              </Text>
              <Bar
                data={{
                  labels: dailyCosts.labels,
                  datasets: [
                    {
                      label: "Daily Cost",
                      data: dailyCosts.data,
                      backgroundColor: "rgba(54, 162, 235, 0.5)",
                    },
                  ],
                }}
              />
            </Box>
            <Box bg="white" shadow="md" borderRadius="lg" p={6}>
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                Cost Optimization Calculator
              </Text>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Text w="150px" fontWeight="medium">
                    Instance Count:
                  </Text>
                  <Input
                    type="number"
                    value={instanceCount}
                    onChange={(e) => setInstanceCount(Number(e.target.value))}
                  />
                </HStack>
                <HStack>
                  <Text w="150px" fontWeight="medium">
                    Hours per Day:
                  </Text>
                  <Input
                    type="number"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  />
                </HStack>
                <HStack>
                  <Text w="150px" fontWeight="medium">
                    Days per Month:
                  </Text>
                  <Input
                    type="number"
                    value={daysPerMonth}
                    onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                  />
                </HStack>
                <HStack>
                  <Text w="150px" fontWeight="medium">
                    Cost per Hour ($):
                  </Text>
                  <Input
                    type="number"
                    value={costPerHour}
                    onChange={(e) => setCostPerHour(Number(e.target.value))}
                  />
                </HStack>
                <Button onClick={estimateCost} colorScheme="blue">
                  Calculate
                </Button>
                <Text fontWeight="bold" fontSize="lg">
                  Estimated Monthly Cost: ${estimatedCost.toFixed(2)}
                </Text>
              </VStack>
            </Box>
            <Box bg="white" shadow="md" borderRadius="lg" p={6}>
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                Cloud Resource Tracker
              </Text>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Resource Name</Th>
                    <Th>Type</Th>
                    <Th isNumeric>Cost ($)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {resources.map((resource, index) => (
                    <Tr key={index}>
                      <Td>{resource.name}</Td>
                      <Td>{resource.type}</Td>
                      <Td isNumeric>{resource.cost}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <Text mt={4} fontWeight="bold" fontSize="lg">
                Total Cost: $
                {resources
                  .reduce((sum, resource) => sum + resource.cost, 0)
                  .toFixed(2)}
              </Text>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Layout>
  )
}

export default Dashboard
