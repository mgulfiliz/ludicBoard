import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useRegisterMutation, useLoginMutation } from '@/lib/api/api';
import { setCredentials } from '@/lib/features/authSlice';
import { toast } from 'react-toastify';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login] = useLoginMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Register the user
      await register({ username, email, password }).unwrap();
      
      // Automatically log in after registration
      const response = await login({ email, password }).unwrap();
      
      // Set credentials in Redux store
      dispatch(setCredentials({
        user: {
          userId: response.userId,
          username: response.username,
          email: response.email
        },
        token: response.token
      }));
  
      toast.success('Registration successful!');
      onClose();
    } catch (error) {
      toast.error('Registration failed');
      console.error('Registration error:', error);
    }
  };

  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="register-modal-title"
      aria-describedby="register-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="register-modal-title" variant="h6" component="h2" gutterBottom>
          Register
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            disabled={isRegistering}
            sx={{ mt: 2 }}
          >
            {isRegistering ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default RegisterModal;