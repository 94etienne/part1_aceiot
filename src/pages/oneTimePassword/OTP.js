import React, { useRef, useState } from 'react';
import { Box, Button, TextField, Typography, Snackbar, Alert, Grid, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../../components/footer/Footer'; 
import LockIcon from '@mui/icons-material/Lock';

export default function OTPInput() {
    const [otp, setOtp] = useState(Array(6).fill(''));
    const inputRefs = useRef([]);
    const navigate = useNavigate(); // Use this if you want to redirect upon submission

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/^[0-9]$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move to next input if a value is entered and it's not the last field
            if (value && index < inputRefs.current.length - 1) {
                inputRefs.current[index + 1].focus();
            }

            // Auto-submit if all fields are filled
            if (newOtp.every((digit) => digit !== '')) {
                handleSubmit(newOtp.join(''));
            }
        }
    };

    const handleSubmit = async (otpCode) => {
        try {
            // Add your submission logic here
            console.log("OTP Submitted: ", otpCode);
            // e.g., Send to API
            // await axios.post('/your-api-endpoint', { otp: otpCode });
            
            // Redirect or show a success message
            // navigate('/success-page'); // Uncomment to navigate upon successful submission
        } catch (error) {
            console.error("Error submitting OTP: ", error);
        }
    };

    return (
        <>
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'primary.main',
                }}
            >
                <Box
                    sx={{
                        height: { xs: 'auto', sm: '64px' },
                        backgroundColor: 'primary.main',
                        paddingY: { xs: 2, sm: 0 },
                    }}
                >
                    <Typography 
                        variant="h6" 
                        component="h1" 
                        sx={{
                            textAlign: 'center',
                            color: 'white',
                            marginX: 'auto',
                            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
                            paddingX: { xs: 2, sm: 0 },
                            fontWeight: 500,
                        }}
                    >
                        ACEIoT LAB - Laboratory Tracking System
                    </Typography>
                </Box>
    
                <Grid 
                    container 
                    justifyContent="center" 
                    alignItems="center" 
                    sx={{ flex: 1, backgroundColor: '#f5f5f5', paddingX: 2 }}
                >
                    <Grid item xs={12} sm={8} md={6} lg={4}>
                        <Box
                            sx={{
                                padding: 3,
                                backgroundColor: 'white',
                                borderRadius: 2,
                                boxShadow: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant="h6" textAlign="center" gutterBottom>
                                Enter OTP Code
                            </Typography>
                            <IconButton color="primary">
                                <LockIcon fontSize="large" />
                            </IconButton>

                            <Box display="flex" gap={1} mt={2}>
                                {otp.map((value, index) => (
                                    <TextField
                                        key={index}
                                        variant="outlined"
                                        value={value}
                                        onChange={(e) => handleChange(e, index)}
                                        inputProps={{
                                            maxLength: 1,
                                            style: { textAlign: 'center', fontSize: '1.5rem' },
                                        }}
                                        sx={{ width: 50 }}
                                        inputRef={(el) => (inputRefs.current[index] = el)}
                                    />
                                ))}
                            </Box>

                            <Typography variant="body2" textAlign="center" mt={2}>
                                OTP Code Submitted to your email
                            </Typography>

                            <Typography
                                variant="body2"
                                color="primary"
                                mt={1}
                                textAlign="center"
                                sx={{ cursor: 'pointer' }}
                            >
                                Resend code? <Link to="/">Click here!</Link>
                            </Typography>

                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2, width: '100%' }}
                                onClick={() => handleSubmit(otp.join(''))}
                            >
                                Submit
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
    
                <Box
                    sx={{
                        height: '64px',
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Footer />
                </Box>
            </Box>
        </>
    );
}
