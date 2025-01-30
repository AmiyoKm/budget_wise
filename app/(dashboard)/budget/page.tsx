import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import CreateBudgetDialog from "./_components/CreateBudgetDialog";
import BudgetsCard from "./_components/BudgetsCard";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const page = async() => {
  const user = await currentUser()
    if(!user){
      redirect("/sign-in")
    }
    const userSettings = await prisma.userSettings.findUnique({
      where : {
        userId : user.id
      }
    })
    if(!userSettings){
      redirect("/wizard")
    }
  return (
    <div className="h-full bg-background">
      <div className=" bg-background">
      <div className="mx-6 max-w-full h-[100px] flex flex-wrap items-center justify-between">
        <p className="text-3xl font-bold ">Budget Management</p>
          <CreateBudgetDialog trigger={
            <Button> <Plus className="w-4 h-4 mr-2" />  Add New Budget</Button>
          } />
      </div>
      <div className="mx-6 mt-5 max-w-full flex flex-col bg-card gap-5">
        <h1 className="text-2xl font-semibold">Running budgets</h1>
          <BudgetsCard userSettings={userSettings} />
      </div>
      </div>
      
    </div>
  );
};

export default page;
