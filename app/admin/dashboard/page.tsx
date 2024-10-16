"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Box,
    Tab,
    Tabs,
    Typography,
    CircularProgress,
    Paper,
    Button
} from '@mui/material'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface ChartData {
    label: string;
    count: number;
}

const fetchUserRegistrations = async (period: string): Promise<ChartData[]> => {
    const response = await axios.get("/api/admin/stats/user-registrations", {
        params: { period }
    });
    return response.data;
}

const fetchContactSubmissions = async (period: string): Promise<ChartData[]> => {
    const response = await axios.get("/api/admin/stats/contact-submissions", {
        params: { period },
    });
    return response.data;
}

const fetchUserSignIns = async (period: string): Promise<ChartData[]> => {
    const response = await axios.get("/api/admin/stats/user-signins", {
        params: { period }
    });
    return response.data;
}

const AdminDashboard = () => {
    const [tabValue, setTabValue] = useState(0);
    const [period, setPeriod] = useState('day');

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setPeriod('day');
    };

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod);
    };

    // Fetch data based on current tab and period
    const {
        data: userRegistrations,
        isLoading: isLoadingUserRegs,
        error: errorUserRegs,
    } = useQuery<ChartData[]>({
        queryKey: ["userRegistrations", period],
        queryFn: () => fetchUserRegistrations(period),
        refetchInterval: 60000,
    });

    const {
        data: contactSubmissions,
        isLoading: isLoadingContactSubs,
        error: errorContactSubs,
    } = useQuery<ChartData[]>({
        queryKey: ["contactSubmissions", period],
        queryFn: () => fetchContactSubmissions(period),
        refetchInterval: 60000,
    });

    const {
        data: userSignIns,
        isLoading: isLoadingUserSignIns,
        error: errorUserSignIns,
    } = useQuery<ChartData[]>({
        queryKey: ["userSignIns", period],
        queryFn: () => fetchUserSignIns(period),
        refetchInterval: 60000,
    });

    const renderChart = (data: ChartData[]) => (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5}}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type='monotone' dataKey='count' stroke='#8884d8' activeDot={{ r: 8}} />
            </LineChart>
        </ResponsiveContainer>
    );

    return (
        <Box className='container mx-auto my-8 px-4'>
            <Typography variant='h4' component='h1' gutterBottom>
                Admin Dashboard
            </Typography>
            <Paper>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant='fullWidth'
                >
                    <Tab label='User Registrations' />
                    <Tab label='Contact Submissions' />
                    <Tab label='User Sign-Ins' />
                </Tabs>
            </Paper>
            <Box className='mt-4'>
                <Box className='flex justify-end mb-4'>
                    <Button
                        variant={period === 'day' ? 'contained' : 'outlined'}
                        color='primary'
                        onClick={() => handlePeriodChange("day")}
                    >
                        Day
                    </Button>
                    <Button
                        variant={period === 'week' ? 'contained' : 'outlined'}
                        color='primary'
                        onClick={() => handlePeriodChange("week")}
                    >
                        Week
                    </Button>
                    <Button
                        variant={period === 'month' ? 'contained' : 'outlined'}
                        color='primary'
                        onClick={() => handlePeriodChange("month")}
                    >
                        Month
                    </Button>
                    <Button
                        variant={period === 'year' ? 'contained' : 'outlined'}
                        color='primary'
                        onClick={() => handlePeriodChange("year")}
                    >
                        Year
                    </Button>
                </Box>
            </Box>

            {tabValue === 0 && (
                <Box>
                    <Typography variant='h6' gutterBottom>
                        User Registrations ({period.charAt(0).toUpperCase() + period.slice(1)})
                    </Typography>
                    {isLoadingUserRegs ? (
                        <CircularProgress />
                    ) : errorUserRegs ? (
                        <Typography color='error'>Error loading user registrations.</Typography>
                    ) : (
                        renderChart(userRegistrations || [])
                    )}
                </Box>
            )}
            {tabValue === 1 && (
                <Box>
                    <Typography variant='h6' gutterBottom>
                        Contact Submissions ({period.charAt(0).toUpperCase() + period.slice(1)})
                    </Typography>
                    {isLoadingContactSubs ? (
                        <CircularProgress />
                    ) : errorContactSubs ? (
                        <Typography color='error'>Error loading contact submissions.</Typography>
                    ) : (
                        renderChart(contactSubmissions || [])
                    )}
                </Box>
            )}
            {tabValue === 2 && (
                <Box>
                    <Typography variant='h6' gutterBottom>
                        User Sign-Ins ({period.charAt(0).toUpperCase() + period.slice(1)})
                    </Typography>
                    {isLoadingUserSignIns ? (
                        <CircularProgress />
                    ) : errorUserSignIns ? (
                        <Typography color='error'>Error loading user sign-ins.</Typography>
                    ) : (
                        renderChart(userSignIns || [])
                    )}
                </Box>
            )}
        </Box>
    )
}

export default AdminDashboard;