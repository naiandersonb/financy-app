"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";

import type { Category } from "@/app/core/domain/transactions/transaction.entity";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CategoryFormDialog } from "./category-form-dialog";

function getCategoryColor(category: Category): string {
  if (
    typeof category.style === "object" &&
    category.style !== null &&
    typeof category.style.backgroundColor === "string"
  ) {
    return category.style.backgroundColor;
  }
  return "hsl(0 0% 80%)";
}

export function CategoryPicker({
  categories,
  value,
  onValueChange,
  invalid,
}: {
  categories: Category[];
  value: string;
  onValueChange: (value: string) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [items, setItems] = useState<Category[]>(categories);

  const selected = items.find((category) => category.id === value);

  const filtered = items.filter((category) =>
    category.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between font-normal",
                invalid && "border-destructive ring-3 ring-destructive/20"
              )}
            />
          }
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: getCategoryColor(selected) }}
              />
              <span className="truncate">{selected.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              Selecione uma categoria
            </span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </PopoverTrigger>

        <PopoverContent align="start" className="w-(--anchor-width) gap-0 p-0">
          <Command loop>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder="Buscar categoria..."
            />
            <CommandList>
              <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
              <CommandGroup>
                {filtered.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.id}
                    data-checked={category.id === value}
                    onSelect={() => {
                      onValueChange(category.id);
                      setOpen(false);
                    }}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <span className="truncate">{category.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          <Button
            type="button"
            variant="ghost"
            className="mx-1 mb-1 justify-start rounded-xl"
            onClick={() => setCategoryDialogOpen(true)}
          >
            <Plus />
            Nova categoria
          </Button>
        </PopoverContent>
      </Popover>

      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onCreated={(category) => {
          setItems((prev) => [...prev, category]);
          onValueChange(category.id);
          setOpen(false);
        }}
      />
    </>
  );
}
