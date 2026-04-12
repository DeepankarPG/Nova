"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@payglocal/ui";

export function DropdownMenuPlayground() {
  const [bookmarks, setBookmarks] = useState(true);
  const [urls, setUrls] = useState(false);
  const [person, setPerson] = useState("pedro");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="w-fit max-w-full shrink-0 self-center"
          rightIcon={<ChevronDown className="size-4 opacity-70" aria-hidden />}
        >
          Menu variants
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[14rem]">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem>
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Team (disabled)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More tools</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Save as…</DropdownMenuItem>
            <DropdownMenuItem>Export CSV</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
          Show bookmarks bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={urls} onCheckedChange={setUrls}>
          Show full URLs
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={person} onValueChange={setPerson}>
          <DropdownMenuRadioItem value="pedro">Pedro Duarte</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="colm">Colm Tuite</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
