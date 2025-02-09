"use client";

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  TaskAlt as TaskIcon, 
  Timeline as TimelineIcon, 
  Analytics as AnalyticsIcon 
} from '@mui/icons-material';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { cn } from '@/lib/utils';
import HomePage from './home/page';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const features = [
    {
      icon: <DashboardIcon />,
      title: 'Project Management',
      description: 'Streamline your projects with intuitive task tracking and organization.'
    },
    {
      icon: <TaskIcon />,
      title: 'Task Prioritization',
      description: 'Prioritize tasks, set deadlines, and collaborate seamlessly.'
    },
    {
      icon: <TimelineIcon />,
      title: 'Progress Tracking',
      description: 'Monitor project progress and team productivity in real-time.'
    },
    {
      icon: <AnalyticsIcon />,
      title: 'Performance Insights',
      description: 'Gain actionable insights to optimize your team\'s performance.'
    }
  ];

  return (
    <div 
      className={cn(
        "min-h-screen",
        "bg-neutral-100 dark:bg-neutral-900", 
        "transition-colors duration-300",
        "flex items-center justify-center",
        "p-4"
      )}
    >
      <Container 
        maxWidth="lg" 
        className="py-8 px-4 text-center"
      >
        <Typography 
          variant="h2" 
          component="h1" 
          className={cn(
            "font-bold mb-6",
            "text-gray-900 dark:text-gray-100", 
            "text-3xl sm:text-4xl md:text-5xl"
          )}
        >
          Welcome to LudicBoard
        </Typography>

        <Typography 
          variant="body1" 
          className={cn(
            "text-gray-700 dark:text-gray-300", 
            "mb-10 max-w-2xl mx-auto",
            "text-base sm:text-lg",
            "opacity-90" 
          )}
        >
          Your all-in-one project management solution designed to boost productivity 
          and streamline team collaboration.
        </Typography>

        <div className="flex justify-center space-x-4 mb-12">
          <Button 
            variant="contained" 
            color="primary" 
            size={isMobile ? 'medium' : 'large'}
            onClick={() => setIsLoginModalOpen(true)}
            className={cn(
              "px-6 py-2",
              "dark:bg-primary dark:hover:bg-primary-dark", 
              "transition-colors duration-300"
            )}
          >
            Login
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size={isMobile ? 'medium' : 'large'}
            onClick={() => setIsRegisterModalOpen(true)}
            className={cn(
              "px-6 py-2",
              "dark:border-primary dark:text-primary", 
              "dark:hover:bg-primary/10", 
              "transition-colors duration-300"
            )}
          >
            Sign Up
          </Button>
        </div>

        <Grid 
          container 
          spacing={3} 
          justifyContent="center"
        >
          {features.map((feature, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={3} 
              key={index}
            >
              <Card 
                className={cn(
                  "h-full",
                  "bg-white dark:bg-neutral-800", 
                  "shadow-md dark:shadow-xl", 
                  "transition-all duration-300",
                  "hover:shadow-lg dark:hover:shadow-2xl",
                  "transform hover:scale-105",
                  "border border-gray-200 dark:border-neutral-700" 
                )}
                elevation={3}
              >
                <CardContent className="text-center p-6">
                  <div className="flex justify-center mb-4">
                    {React.cloneElement(feature.icon, {
                      color: 'primary',
                      sx: { 
                        fontSize: isMobile ? 40 : 60,
                        color: 'primary.main' 
                      }
                    })}
                  </div>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    className={cn(
                      "mb-3",
                      "text-gray-800 dark:text-gray-100", 
                      "font-semibold"
                    )}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    className={cn(
                      "text-gray-600 dark:text-gray-300", 
                      "opacity-90" 
                    )}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Authentication Modals */}
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
        <RegisterModal 
          isOpen={isRegisterModalOpen} 
          onClose={() => setIsRegisterModalOpen(false)} 
        />
      </Container>
    </div>
  );
};

export default function Home() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Render the authenticated homepage or the landing page based on authentication status
  return isAuthenticated ? <HomePage /> : <LandingPage />;
}
