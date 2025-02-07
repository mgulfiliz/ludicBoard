"use client";

import Header from "@/components/layout/Header";
import ProjectCard from "@/components/ui/ProjectCard";
import TaskCard from "@/components/ui/TaskCard";
import UserCard from "@/components/ui/UserCard";
import { useSearchQuery } from "@/lib/api/api";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import { 
  TextField, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Alert, 
  Stack 
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { SearchResults } from "@/types";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<keyof SearchResults>('tasks');
  const {
    data: searchResults,
    isLoading,
    isError,
  } = useSearchQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    500,
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: keyof SearchResults) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    return handleSearch.cancel;
  }, [handleSearch.cancel]);

  const renderResults = () => {
    if (isLoading) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="200px"
          className="dark:bg-dark-bg bg-white"
        >
          <CircularProgress className="dark:text-gray-300" />
        </Box>
      );
    }

    if (isError) {
      return (
        <Alert 
          severity="error" 
          className="dark:bg-red-900/20 dark:text-red-300"
        >
          Error occurred while fetching search results.
        </Alert>
      );
    }

    if (!searchResults || Object.values(searchResults).every(arr => arr?.length === 0)) {
      return (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          height="200px"
          className="dark:bg-dark-bg bg-white"
        >
          <Typography 
            variant="h6" 
            className="dark:text-gray-300 text-gray-700"
          >
            No results found
          </Typography>
          <Typography 
            variant="body2" 
            className="dark:text-gray-500 text-gray-500 mt-2"
          >
            Try a different search term
          </Typography>
        </Box>
      );
    }

    const resultsMap = {
      tasks: searchResults.tasks?.map((task) => (
        <TaskCard key={task.id} task={task} />
      )),
      projects: searchResults.projects?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      )),
      users: searchResults.users?.map((user) => (
        <UserCard key={user.userId} user={user} />
      ))
    };

    return (
      <Stack spacing={2} className="p-4">
        {resultsMap[activeTab] || null}
      </Stack>
    );
  };

  return (
    <div className="p-8 dark:bg-dark-bg min-h-screen">
      <Header name="Search" />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2 
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tasks, projects, and users..."
          InputProps={{
            startAdornment: <SearchIcon className="dark:text-gray-400 mr-2" />,
          }}
          className="dark:bg-gray-800 dark:text-gray-200 rounded-lg"
          onChange={handleSearch}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />

        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          centered
          className="dark:bg-gray-800 rounded-lg"
          sx={{
            '& .MuiTab-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab 
            value="tasks" 
            label={`Tasks (${searchResults?.tasks?.length || 0})`} 
            className="dark:text-gray-300"
          />
          <Tab 
            value="projects" 
            label={`Projects (${searchResults?.projects?.length || 0})`} 
            className="dark:text-gray-300"
          />
          <Tab 
            value="users" 
            label={`Users (${searchResults?.users?.length || 0})`} 
            className="dark:text-gray-300"
          />
        </Tabs>

        {renderResults()}
      </Box>
    </div>
  );
};

export default Search;
