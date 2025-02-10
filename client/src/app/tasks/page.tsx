"use client";

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  useGetTasksByUserQuery 
} from "@/lib/api/api";
import { RootState } from "@/app/redux";
import TaskCard from "@/components/ui/TaskCard";
import Header from "@/components/layout/Header";
import ModalNewTask from "@/components/ui/ModalNewTask";
import { 
  Button, 
  MenuItem, 
  Select, 
  TextField, 
  Box, 
  Chip, 
  Stack,
  Typography 
} from "@mui/material";
import { 
  Add as AddIcon, 
  FilterList as FilterIcon, 
  Sort as SortIcon 
} from "@mui/icons-material";
import { Priority, Status, Task } from "@/types";

const TasksPage = () => {
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [filterPriority, setFilterPriority] = useState<Priority | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof Task>("priority");

  // Get user ID from Redux store
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const {
    data: tasks,
    isLoading,
    isError,
  } = useGetTasksByUserQuery(userId || 0, {
    skip: userId === null,
  });

  // Advanced filtering and sorting
  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks
      .filter(task => 
        (filterStatus === "All" || task.status === filterStatus) &&
        (filterPriority === "All" || task.priority === filterPriority) &&
        (searchQuery === "" || 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      .sort((a, b) => {
        if (sortBy === "priority") {
          const priorityOrder = {
            [Priority.Urgent]: 5,
            [Priority.High]: 4,
            [Priority.Medium]: 3,
            [Priority.Low]: 2,
            [Priority.Backlog]: 1
          };
          return priorityOrder[b.priority || Priority.Backlog] - 
                 priorityOrder[a.priority || Priority.Backlog];
        }
        return 0;
      });
  }, [tasks, filterStatus, filterPriority, searchQuery, sortBy]);

  const clearFilters = () => {
    setFilterStatus("All");
    setFilterPriority("All");
    setSearchQuery("");
    setSortBy("priority");
  };

  if (isLoading) return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      height="100vh"
    >
      <Typography variant="h6">Loading tasks...</Typography>
    </Box>
  );

  if (isError) return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      height="100vh"
      color="error.main"
    >
      <Typography variant="h6">Error fetching tasks</Typography>
    </Box>
  );

  return (
    <div className="m-5 p-4">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />
      <Header
        name="My Tasks"
        buttonComponent={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Create New Task
          </Button>
        }
      />

      {/* Filtering and Sorting Controls */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', md: 'row' }}
        gap={2} 
        mb={3} 
        mt={2}
        alignItems="center"
      >
        <TextField 
          label="Search Tasks" 
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1 }}
        />

        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2} 
          alignItems="center"
        >
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Status | "All")}
            startAdornment={<FilterIcon />}
            displayEmpty
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            {Object.values(Status).map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>

          <Select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | "All")}
            startAdornment={<SortIcon />}
            displayEmpty
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="All">All Priorities</MenuItem>
            {Object.values(Priority).map(priority => (
              <MenuItem key={priority} value={priority}>{priority}</MenuItem>
            ))}
          </Select>

          {(filterStatus !== "All" || filterPriority !== "All" || searchQuery) && (
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      </Box>

      {/* Active Filters Display */}
      {(filterStatus !== "All" || filterPriority !== "All" || searchQuery) && (
        <Box mb={2}>
          <Stack direction="row" spacing={1}>
            {filterStatus !== "All" && (
              <Chip 
                label={`Status: ${filterStatus}`} 
                onDelete={() => setFilterStatus("All")} 
              />
            )}
            {filterPriority !== "All" && (
              <Chip 
                label={`Priority: ${filterPriority}`} 
                onDelete={() => setFilterPriority("All")} 
              />
            )}
            {searchQuery && (
              <Chip 
                label={`Search: ${searchQuery}`} 
                onDelete={() => setSearchQuery("")} 
              />
            )}
          </Stack>
        </Box>
      )}

      {filteredAndSortedTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="50vh" 
          textAlign="center"
        >
          <Typography variant="h6" color="text.secondary">
            No tasks found matching your filters. 
            {(filterStatus !== "All" || filterPriority !== "All" || searchQuery) && (
              <> Try clearing your filters or </>
            )}
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              Create a New Task
            </Button>
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default TasksPage;
