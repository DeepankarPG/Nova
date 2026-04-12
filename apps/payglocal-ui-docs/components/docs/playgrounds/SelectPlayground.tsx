"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Stack,
} from "@payglocal/ui";

export function SelectPlayground() {
  return (
    <Stack gap="lg" className="w-full max-w-md self-center">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Grouped + labels + separator</p>
        <Select defaultValue="inr">
          <SelectTrigger className="h-11 w-full text-[15px]">
            <SelectValue placeholder="Choose currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Major</SelectLabel>
              <SelectItem value="usd">USD — US Dollar</SelectItem>
              <SelectItem value="eur">EUR — Euro</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Asia Pacific</SelectLabel>
              <SelectItem value="inr">INR — Indian Rupee</SelectItem>
              <SelectItem value="sgd">SGD — Singapore Dollar</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Flat list</p>
        <Select defaultValue="30d">
          <SelectTrigger className="h-11 w-full text-[15px]">
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Stack>
  );
}
