/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import { useGetUsersQuery } from "@/state/api";
import Image from "next/image";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface User {
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
}

interface Props {
  assignedUserId: string;
  setAssignedUserId: (value: string) => void;
  label?: string;
}

export default function AssignedUserSelect({
  assignedUserId,
  setAssignedUserId,
  label = "Assigned Users",
}: Props) {
  const theme = useTheme();
  const { data: users, isLoading, isError } = useGetUsersQuery();

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;

    const selectedUserIds = typeof value === "string" ? value.split(",") : value;
    setAssignedUserId(selectedUserIds.join(","));
  };

  if (isLoading) return <div>Loading users...</div>;
  if (isError || !users) return <div>Error fetching users.</div>;

  const selectedIds = assignedUserId ? assignedUserId.split(",").map(Number) : [];

  return (
    <FormControl sx={{ m: 1, width: 300 }}>
      <InputLabel id="assigned-user-select-label">{label}</InputLabel>
      <Select
        labelId="assigned-user-select-label"
        id="assigned-user-select"
        multiple
        value={selectedIds.map(String)}
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-chip" label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((id) => {
              const user = users.find((user) => user.userId === Number(id));
              return user ? (
                <Chip
                  key={id}
                  avatar={
                    user.profilePictureUrl ? (
                      <Image
                        src={`/${user.profilePictureUrl}`}
                        alt={user.username}
                        width={30}
                        height={30}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : undefined
                  }
                  label={user.username}
                />
              ) : null;
            })}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {users.map((user) => (
          <MenuItem
            key={user.userId}
            value={user.userId}
            style={{
              fontWeight: selectedIds.includes(user.userId!)
                ? theme.typography.fontWeightMedium
                : theme.typography.fontWeightRegular,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {user.profilePictureUrl ? (
                <Image
                  src={`/${user.profilePictureUrl}`}
                  alt={user.username}
                  width={30}
                  height={30}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    backgroundColor: "gray",
                  }}
                />
              )}
              {user.username}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
