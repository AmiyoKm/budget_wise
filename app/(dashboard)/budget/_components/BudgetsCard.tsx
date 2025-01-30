"use client";
import { GetRunningBudget } from "@/actions/GetRunningBudget";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import CreateBudgetDialog from "./CreateBudgetDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget, UserSettings } from "@prisma/client";
import { Progress } from "@/components/ui/progress";
import SkeletonWrapper from "@/components/SkeletonWrapper";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Circle, Cross } from "lucide-react";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddSpendingToBudget } from "@/actions/AddSpendingToBudget";
import { addSpendingSchema } from "@/schema/budget";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DeleteBudget } from "@/actions/DeleteBudget";
import UpdateBudgetDialog from "./EditBudgetDialog";
import { Badge } from "@/components/ui/badge";
import { GetFormatterCurrency } from "@/lib/helpers/date";
import CountUp from "react-countup";
const BudgetsCard = ({userSettings} : {userSettings : UserSettings}) => {
  const budgetQuery = useQuery<Budget[]>({
    queryKey: ["budget"],
    queryFn: () => GetRunningBudget(),
  });
  const formatter = useMemo(()=> {
    return GetFormatterCurrency(userSettings.currency)
  },[userSettings.currency])

  const dataAvailable = budgetQuery.data && budgetQuery.data.length > 0;
  return dataAvailable ? (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
      {budgetQuery.data.map((budget) => (
        <BudgetCards
          key={budget.name}
          budget={budget}
          isLoading={budgetQuery.isFetching}
          formatter={formatter}
        />
      ))}
    </div>
  ) : (
    <SkeletonWrapper isLoading={budgetQuery.isFetching}>
      <div className="w-full h-52 flex flex-col items-center justify-center rounded-lg ">
        <p className="text-gray-700 text-lg mb-4">
          No goals available currently
        </p>
        <CreateBudgetDialog
          trigger={
            <Button className=" text-white px-4 py-2 rounded-lg">
              Set a new budget to get started
            </Button>
          }
        />
      </div>
    </SkeletonWrapper>
  );
};

export default BudgetsCard;

function BudgetCards({
  budget,
  isLoading,
  formatter
}: {
  budget: Budget;
  isLoading: boolean;
  formatter : Intl.NumberFormat
}) {
  const progress = (budget.spent / budget.amount) * 100;
  const remaining = budget.amount - budget.spent;
  const FormatterFn = useCallback((value : number)=>{
    return formatter.format(value)
  },[formatter ])
  const getStatus = ()=> {
    if(progress >= 100 && budget.endDate >= new Date()) return (
      <Badge variant="outline" className="gap-1.5">
      <Check className="text-emerald-500" size={12} strokeWidth={2} aria-hidden="true" />
      Completed
    </Badge>
    )
    else if(progress <= 100 && budget.endDate >= new Date()) return (
      <Badge variant="outline" className="gap-1.5">
      <Circle className="text-orange-500" size={12} strokeWidth={2} aria-hidden="true" />
      Ongoing
    </Badge>
    )
    else if(progress <= 100 && budget.endDate <= new Date()) return (
      <Badge variant="outline" className="gap-1.5">
      <Cross className="text-red-500" size={12} strokeWidth={2} aria-hidden="true" />
      Date exceeded
    </Badge>
    )
    else if(progress >= 100 && budget.endDate <= new Date()) return (
      <Badge variant="outline" className="gap-1.5">
      <Check className="text-purple-500" size={12} strokeWidth={2} aria-hidden="true" />
        Budget reached and Date Exceeded
    </Badge>
    )
   
  }
  return (
    <SkeletonWrapper isLoading={isLoading} fullWidth={false}>
      <Card key={budget.name} className="space-y-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-medium">
            {budget.icon} {budget.name}
          </CardTitle>

          <DropdownButton budget={budget} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-2xl font-bold">
          <CountUp preserveValue redraw={false}  end={budget.spent} formattingFn={FormatterFn} decimals={2} duration={1.5} />{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {formatter.format(budget.amount)}
            </span>
          </div>
          <Progress value={progress} className="mt-2 " />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Remaining: {remaining > 0  ?  <CountUp preserveValue redraw={false}  end={remaining} formattingFn={FormatterFn} decimals={2} duration={1.5} /> : "None"}</span>
            <span>{progress.toFixed(0)}% used</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
            <p>{budget.startDate.toLocaleDateString()} -{" "}
            {budget.endDate.toLocaleDateString()}</p>
            {
              getStatus()
            }
          </div>
        </CardContent>
      </Card>
    </SkeletonWrapper>
  );
}

function DropdownButton({
  budget,
  trigger,
}: {
  budget: Budget;
  trigger?: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <HamburgerMenuIcon strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="space-y-2">
        <UpdateBudgetDialog budget={budget}  trigger={
          <DropdownMenuItem onSelect={(e)=> e.preventDefault()}>
          <span>Edit</span>
        </DropdownMenuItem>
        } />

        <AddSpendingDialog
          budget={budget}
          trigger={<DropdownMenuItem onSelect={(e)=> e.preventDefault()}>Add Spending</DropdownMenuItem>}
        />

       <DeleteBudgetDialog  budget={budget} trigger={
         <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e)=> e.preventDefault()}>
         <span>Delete</span>

       </DropdownMenuItem>
       } />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}





function AddSpendingDialog({
  budget,
  trigger,
}: {
  budget: Budget;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof addSpendingSchema>>({
    resolver: zodResolver(addSpendingSchema),
    defaultValues: { },
  });
  const mutation = useMutation({
    mutationKey : ["budget", "add-spending"],
    mutationFn : AddSpendingToBudget,
    onSuccess : ()=>{
      queryClient.invalidateQueries({
        queryKey : ["budget"]
      })
    }
  })

  const onSubmit = (data: z.infer<typeof addSpendingSchema>) => {
    mutation.mutate({data , budget})
    
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add your spending</DialogTitle>
          <DialogDescription>
            Recorded amount will be saved into the budget
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


interface Props {
  trigger : ReactNode ,
  budget : Budget
}
const DeleteBudgetDialog = ({trigger ,budget} :Props) => {
  const queryClient= useQueryClient()
  const deleteMutation = useMutation({
      mutationKey : ["budget" ,"delete" ],
      mutationFn :   DeleteBudget ,
      onSuccess :async ()=>{
          toast.success("Budget deleted successfully", {
              id : "budget-delete"
          })
          await queryClient.invalidateQueries({
              queryKey : ["budget"]
          })
      },
      onError :()=>{
          toast.error("Something went wrong", {id : "budget-delete"})
      }
  }) 
return (
  <AlertDialog>
      <AlertDialogTrigger asChild>
          {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete your budget</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className={buttonVariants({
                  variant : "destructive"
              })} onClick={()=>{
                  toast.loading("Deleting budget..." ,{
                      id :  "budget-delete"
                  } )
                  deleteMutation.mutate(budget)
              }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
  </AlertDialog>
)
}