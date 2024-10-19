"use client"

import React, { useState, useCallback } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Box, Button, Typography, Alert, Snackbar, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';

const AdminUploadPage = () => {
    const { data: session } = useSession();
    const router = useRouter();

    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [chunkType, setChunkType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
    const [width, setWidth] = useState<number | undefined>(undefined);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success'});

    const handleUpload = useCallback(
        (result: any) => {
            const url = result.info.secure_url;
            setUploadedUrls((prev) => [...prev, url]);
            setSnackbar({ open: true, message: 'File uploaded successfully', severity: 'success'});
        },
        []
    );

    const handleError = useCallback(
        (error: any) => {
            console.error('Upload Error:', error);
            setSnackbar({ open: true, message: "File upload failed", severity: 'error'});
        },
        []
    );

    if (!session || ((session.user as any).role !== UserRole.ADMIN && (session.user as any).role !== UserRole.DEVELOPER)) {
        router.push('/auth/sign-in');
        return null;
    }

    const handleSubmit = () => {
        if ((chunkType === 'IMAGE' || chunkType === 'VIDEO') && (!width || !height)) {
            setSnackbar({ open: true, message: 'Please specify width and height', severity: 'error'});
            return;
        }

        if (uploadedUrls.length === 0) {
            setSnackbar({ open: true, message: 'No files uploaded.', severity: 'error'});
            return;
        }

        uploadedUrls.forEach((url) => {
            console.log(`Type: ${chunkType}, URL: ${url}, Width: ${width}, Height: ${height}`);
            // TODO: Send the data to the api to store in the DB
        })

        // Reset states after submission
        setUploadedUrls([]);
        setWidth(undefined);
        setHeight(undefined);
        setChunkType('IMAGE');
    }

    return (
        <Box className='container mx-auto my-8 px-4'>
            <Typography variant='h4' component='h1' gutterBottom>
                Admin Media Upload
            </Typography>
            <Box className='flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4'>
                <FormControl className='min-w-120'>
                    <InputLabel id='chunk-type-label'>Type</InputLabel>
                    <Select
                        labelId='chunk-type-label'
                        value={chunkType}
                        label='Type'
                        onChange={(e) => setChunkType(e.target.value as 'IMAGE' | 'VIDEO')}
                    >
                        <MenuItem value='IMAGE'>Image</MenuItem>
                        <MenuItem value='VIDEO'>Video</MenuItem>
                    </Select>
                </FormControl>
                <CldUploadWidget
                    uploadPreset='miniverse_site_general'
                    onSuccess={handleUpload}
                    onError={handleError}
                    options={{
                        maxFiles: 1,
                        resourceType: chunkType.toLowerCase(), // 'image' or 'video'
                    }}
                >
                    {({ open }) => {
                        function handleOnClick() {
                            open();
                        }

                        return (
                            <Button variant='contained' onClick={handleOnClick}>
                                Upload {chunkType}
                            </Button>
                        );
                    }}
                </CldUploadWidget>
                {(chunkType === 'IMAGE' || chunkType === 'VIDEO') && (
                    <>
                        <TextField
                            label="Width (px)"
                            type='number'
                            value={width || ''}
                            onChange={(e) => setWidth(e.target.value ? parseInt(e.target.value) : undefined)}
                            InputProps={{ inputProps: { min: 1 }}}
                            className='w-24'
                        />
                        <TextField
                            label="Height (px)"
                            type='number'
                            value={height || ''}
                            onChange={(e) => setHeight(e.target.value ? parseInt(e.target.value) : undefined)}
                            InputProps={{ inputProps: { min: 1 }}}
                            className='w-24'
                        />
                    </>
                )}
                <Button variant='contained' color='primary' onClick={handleSubmit}>
                    Save Uploads
                </Button>
            </Box>

            {uploadedUrls.length > 0 && (
                <Box className="mt-4">
                <Typography variant="h6">Uploaded Files:</Typography>
                <ul>
                    {uploadedUrls.map((url, index) => (
                    <li key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                        {url}
                        </a>
                    </li>
                    ))}
                </ul>
                </Box>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                severity={snackbar.severity}
                sx={{ width: "100%" }}
                >
                {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default AdminUploadPage;