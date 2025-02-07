import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/lib/api/api";

const High = () => {
  return <ReusablePriorityPage priority={Priority.High} />;
};

export default High;
