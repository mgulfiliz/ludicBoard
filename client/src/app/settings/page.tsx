"use client";

import React, { useState } from "react";
import { 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel, 
  IconButton, 
  Tooltip,
  Snackbar,
  Alert
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Person as PersonIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  WorkOutline as WorkIcon,
  Brightness4 as ThemeIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from "@mui/icons-material";
import Header from "@/components/layout/Header";
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from "@/lib/api/api";

const Settings = () => {
  const { data: userProfile, isLoading, error } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

  const [editMode, setEditMode] = useState({
    username: false,
    email: false,
  });
  const [editedProfile, setEditedProfile] = useState({
    username: userProfile?.username || '',
    email: userProfile?.email || '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleEdit = (field: 'username' | 'email') => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleCancel = (field: 'username' | 'email') => {
    setEditMode(prev => ({ ...prev, [field]: false }));
    setEditedProfile({
      username: userProfile?.username || '',
      email: userProfile?.email || '',
    });
  };

  const handleSave = async (field: 'username' | 'email') => {
    try {
      await updateProfile({
        [field]: editedProfile[field]
      }).unwrap();
      
      setEditMode(prev => ({ ...prev, [field]: false }));
      setSnackbarMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage(`Failed to update ${field}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleChange = (field: 'username' | 'email', value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error loading profile</Typography>;

  return (
    <div className="p-8 dark:bg-gray-900 min-h-screen">
      <Header name="Settings" />
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white">
            <PersonIcon className="mr-2 dark:text-gray-300" /> Profile Details
          </h2>
          
          <div className="space-y-4">
            {/* Username */}
            <div className="flex items-center space-x-2">
              <span className="flex-grow dark:text-gray-300">Username</span>
              {!editMode.username ? (
                <>
                  <span className="dark:text-white">{userProfile?.username}</span>
                  <Tooltip title="Edit Username">
                    <IconButton onClick={() => handleEdit('username')}>
                      <EditIcon className="dark:text-gray-300" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <div className="flex items-center space-x-2 flex-grow">
                  <TextField 
                    fullWidth 
                    value={editedProfile.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                  <Tooltip title="Save">
                    <IconButton onClick={() => handleSave('username')}>
                      <SaveIcon className="dark:text-gray-300" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton onClick={() => handleCancel('username')}>
                      <CancelIcon className="dark:text-gray-300" />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center space-x-2">
              <span className="flex-grow dark:text-gray-300">Email</span>
              {!editMode.email ? (
                <>
                  <span className="dark:text-white">{userProfile?.email}</span>
                  <Tooltip title="Edit Email">
                    <IconButton onClick={() => handleEdit('email')}>
                      <EditIcon className="dark:text-gray-300" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <div className="flex items-center space-x-2 flex-grow">
                  <TextField 
                    fullWidth 
                    value={editedProfile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                  <Tooltip title="Save">
                    <IconButton onClick={() => handleSave('email')}>
                      <SaveIcon className="dark:text-gray-300" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton onClick={() => handleCancel('email')}>
                      <CancelIcon className="dark:text-gray-300" />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organization Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white">
            <GroupIcon className="mr-2 dark:text-gray-300" /> Organization Details
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <WorkIcon className="mr-2 dark:text-gray-300" />
              <span className="dark:text-white">Team: {userProfile?.team?.teamName || 'Not Assigned'}</span>
            </div>
            <div className="flex items-center">
              <WorkIcon className="mr-2 dark:text-gray-300" />
              <span className="dark:text-white">Role: {userProfile?.role || 'Not Specified'}</span>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white">
            <ThemeIcon className="mr-2 dark:text-gray-300" /> Preferences
          </h2>
          
          <div className="flex items-center space-x-4">
            <span className="dark:text-white">Theme</span>
            <div className="flex items-center space-x-2">
              <LightModeIcon className="dark:text-gray-300" />
              <Switch
                checked={document.documentElement.classList.contains('dark')}
                onChange={toggleDarkMode}
              />
              <DarkModeIcon className="dark:text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Settings;
