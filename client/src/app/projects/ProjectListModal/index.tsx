import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  Stack 
} from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { Project } from '@/lib/api/api';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ProjectListModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

const ProjectListModal = ({ 
  isOpen, 
  onClose, 
  projects 
}: ProjectListModalProps) => {
  const router = useRouter();

  const handleProjectClick = (projectId: number) => {
    router.push(`/projects/${projectId}`);
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="project-list-dialog-title"
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'white',
          backgroundImage: 'none',
          borderRadius: 4,
          '@media (prefers-color-scheme: dark)': {
            backgroundColor: '#1e1e1e'
          }
        }
      }}
      className="bg-white dark:bg-dark-bg rounded-xl"
    >
      <DialogTitle 
        id="project-list-dialog-title" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2,
          backgroundColor: 'white',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }}
        className="dark:bg-dark-bg bg-white dark:text-gray-200 rounded-t-xl"
      >
        <Typography variant="h6" component="span" className="dark:text-gray-200">
          Your Projects
        </Typography>
      </DialogTitle>
      
      <DialogContent 
        dividers 
        className="dark:bg-dark-bg bg-white dark:border-gray-700 border-gray-300 rounded-b-xl"
        sx={{
          backgroundColor: 'white',
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16
        }}
      >
        {projects.length === 0 ? (
          <Box 
            className="dark:bg-dark-bg bg-white dark:text-gray-300 text-gray-700 text-center rounded-xl"
            sx={{ 
              textAlign: 'center', 
              py: 4, 
              backgroundColor: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom className="dark:text-gray-200 text-gray-900">
              No projects found
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }} className="dark:text-gray-400 text-gray-600">
              No projects are currently available.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {projects.map((project) => (
              <Box
                key={project.id}
                className="dark:bg-gray-800 bg-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 2,
                  transition: 'background-color 0.2s',
                  backgroundColor: 'white'
                }}
                onClick={() => handleProjectClick(project.id)}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} className="dark:text-gray-200 text-gray-900">
                      {project.name}
                    </Typography>
                    <Chip 
                      label={project.endDate ? 'Completed' : 'Active'} 
                      color={project.endDate ? 'secondary' : 'primary'}
                      size="small"
                      className="dark:bg-gray-700 dark:text-gray-300 rounded-md"
                    />
                  </Box>
                  <Typography 
                    variant="body2" 
                    className="text-gray-600 dark:text-gray-300 dark:opacity-70"
                  >
                    {project.startDate && project.endDate 
                      ? `${format(new Date(project.startDate), 'MMM d')} - ${format(new Date(project.endDate), 'MMM d, yyyy')}`
                      : project.startDate 
                      ? `Starts ${format(new Date(project.startDate), 'MMM d, yyyy')}`
                      : project.endDate 
                      ? `Ends ${format(new Date(project.endDate), 'MMM d, yyyy')}`
                      : 'No dates specified'}
                    {project.description && ` | ${project.description}`}
                  </Typography>
                </Box>
                <ChevronRight 
                  className="text-gray-500 dark:text-gray-400 dark:opacity-70"
                />
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectListModal;
