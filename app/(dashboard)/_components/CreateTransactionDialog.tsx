"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/Transaction";
import { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import CategoryPicker from "./CategoryPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {  CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "@/actions/CreateTransaction";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers/date";
interface Props {
  trigger: ReactNode;
  type: TransactionType;
}

export function CreateTransactionDialog({ trigger, type }: Props) {
    const [open , setOpen] = useState(false)
  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      description: "",
      amount: 0,
      date: new Date(),
    },
  });
  const handleCategoryChange = useCallback(
    (value: string) => {
      form.setValue("category", value);
    },
    [form]
  );
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey : ["transaction"],
    mutationFn : CreateTransaction,
    onSuccess :async()=>{
      setOpen(prev => !prev)
      toast.success("Transaction created successfully 🚀", {id : "create-transaction"})
      await queryClient.invalidateQueries({
        queryKey : ["overview"]
      })
      form.reset({
        type ,
        description : "",
        date : new Date(),
        category : undefined
      })
    }
  })
  const onSubmit = useCallback((value : CreateTransactionSchemaType)=>{
    toast.loading("Creating transaction", {id : "create-transaction"})
    mutation.mutate({
        ...value , date : DateToUTCDate(value.date)
    }
    )
  },[mutation])
  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create a new{" "}
            <span
              className={cn(
                "m-1",
                type === "income" ? "text-emerald-500" : "text-red-500"
              )}
            >
              {type}
            </span>{" "}
            transaction
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Transaction description (optional)
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type={"number"} {...field} />
                  </FormControl>
                  <FormDescription>
                    Transaction amount (required)
                  </FormDescription>
                </FormItem>
              )}
            />
            Transaction : {form.watch("category")}
            <div className="flex items-center justify-between gap-2">
              <FormField 
                control={form.control}
                name="category"
                render={({}) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="my-1">Category</FormLabel>
                    <FormControl>
                      <CategoryPicker
                        type={type}
                        onChange={handleCategoryChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Select a category for transaction
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="my-1">Transaction date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[200px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
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
                      <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={field.value} onSelect={value =>{
                                if(!value) return
                                field.onChange(value)
                                
                            }} initialFocus
                            
                            />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Select a date for this</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
            <div className='w-full flex justify-between gap-6'>
            <DialogClose asChild className='flex-1'>
                <Button type='button' variant={"secondary"} onClick={()=>{
                    form.reset()
                }}>
                    Cancel
                </Button>
            </DialogClose>
            <Button className='flex-1' onClick={form.handleSubmit(onSubmit)} disabled={mutation.isPending}>{mutation.isPending ? <Loader2 className='animate-spin' />  :  "Create"  }</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
