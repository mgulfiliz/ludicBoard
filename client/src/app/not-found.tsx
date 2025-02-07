import Link from 'next/link';
import { Button, Typography, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

export default function NotFound() {
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
        backgroundColor: 'background.default'
      }}
      className="dark:bg-dark-bg bg-gray-100"
    >
      <ErrorOutlineIcon 
        sx={{ 
          fontSize: 100, 
          color: 'error.main',
          mb: 2 
        }} 
        className="dark:text-red-600 text-red-500"
      />
      
      <Typography 
        variant="h4" 
        gutterBottom 
        className="dark:text-gray-200 text-gray-900"
      >
        404 - Page Not Found
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ mb: 3 }}
        className="dark:text-gray-400 text-gray-600"
      >
        Oops! The page you are looking for does not exist.
      </Typography>
      
      <Link href="/" passHref>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          className="dark:bg-blue-700 dark:text-gray-200 bg-blue-500 text-white rounded-lg"
        >
          Return to Home
        </Button>
      </Link>
    </Box>
  );
}
