"use client";
import React, { useEffect, useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm, UseFormReturn, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBudgetSchema, CreateBudgetSchemaType } from "@/schema/budget";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addMonths, addWeeks, addYears, format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateBudget } from "@/actions/CreateBudget";
import { toast } from "sonner";

type Form = UseFormReturn<
  {
    name: string;
    icon: string;
    endDate: Date;
    amount: number;
    timePeriod: "MONTH" | "WEEK" | "YEAR" | "CUSTOM";
  },
  any,
  undefined
>;

const CreateBudgetDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const queryClient =useQueryClient()
  const form = useForm<CreateBudgetSchemaType>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      icon: "",
      name: "",
      timePeriod: "MONTH",
    },
  });
  const mutation = useMutation({
    mutationKey: ["budget"],
    mutationFn: CreateBudget,
    onSuccess: () => {
      toast.success("Budget created successfully. 🐲", { id: "create-budget" });
      setOpen((prev) => !prev);
      queryClient.invalidateQueries({
        queryKey : ["budget"]
      })
      form.reset();
    },
    onError: () => {
      toast.error("Budget names must be unique", { id: "create-budget" });
    },
  });
  const onSubmit = async (data: CreateBudgetSchemaType) => {
    toast.loading("Creating your budget...", { id: "create-budget" });
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            Create a new budget
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Setup a budget and track your goal
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="my-1 text-gray-700">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Budget name..."
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="my-1 text-gray-700">Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Budget amount..."
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <EmojiPickerFormField
              control={form.control}
              name="icon"
              label="Select an Icon"
              form={form}
            />
            <FormField
              control={form.control}
              name="timePeriod"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-gray-700">Time Period</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      {...field}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WEEK">Weekly</SelectItem>
                        <SelectItem value="MONTH">Monthly</SelectItem>
                        <SelectItem value="YEAR">Yearly</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <SelectTimePeriod form={form} />
          </form>
        </Form>
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose>
            <Button type="button" variant="secondary" className="bg-gray-200 text-gray-700">
              Close
            </Button>
          </DialogClose>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBudgetDialog;

function EmojiPickerFormField({
  control,
  name,
  label,
  form,
}: {
  control: any;
  name: string;
  label: string;
  form: Form;
}) {
  const theme = useTheme();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700">{label}</FormLabel>
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-[100px] w-full justify-start text-2xl border border-gray-300 rounded-md"
                >
                  {form.watch("icon") ? (
                    <div className="flex flex-1 flex-col justify-center items-center gap-2">
                      <span className="text-5xl" role="img">
                        {field.value}
                      </span>
                      <p className="text-sm text-gray-500">Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-1 justify-center flex-col items-center gap-2">
                      <div className="container">🐸</div>
                      <p className="text-sm text-gray-500">Click to select</p>
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-4 bg-white border border-gray-300 rounded-md shadow-lg">
                <Picker
                  data={data}
                  theme={theme.resolvedTheme}
                  onEmojiSelect={(emoji: { native: string }) => {
                    field.onChange(emoji.native);
                  }}
                />
              </PopoverContent>
            </Popover>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

function SelectTimePeriod({ form }: { form: Form }) {
  const timePeriod = useWatch({
    control: form.control,
    name: "timePeriod",
  });
  useEffect(() => {
    const newDate = getDate(timePeriod, form);
    form.setValue("endDate", newDate, { shouldValidate: true });
  }, [timePeriod, form]);

  return (
    <FormField
      control={form.control}
      name="endDate"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="my-1 text-gray-700">Select end date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal border border-gray-300 rounded-md",
                    !field.value && "text-gray-500"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border border-gray-300 rounded-md shadow-lg" align="start">
              {form.watch("timePeriod") === "CUSTOM" && (
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              )}
            </PopoverContent>
          </Popover>
          <FormDescription className="text-gray-500">
            To select a custom end date,
          </FormDescription>
          <FormDescription className="text-gray-500">
            select <span className="font-semibold">Custom</span> in Time Period option
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function getDate(timePeriod: string, form: Form) {
  switch (timePeriod) {
    case "MONTH":
      return addMonths(new Date(), 1);
    case "WEEK":
      return addWeeks(new Date(), 1);
    case "YEAR":
      return addYears(new Date(), 1);
    case "CUSTOM":
      return form.getValues("endDate") || new Date();
    default:
      return new Date();
  }
}