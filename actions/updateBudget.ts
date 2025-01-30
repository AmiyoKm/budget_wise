"use server"

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { Budget } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function  UpdateBudget(budget : Budget){
     const user = await currentUser()
            
            if(!user){
                redirect("/sign-in")
            }
            console.log("@@BUDGETID"  ,budget.id);
            
            const givenBudget = await prisma.budget.findUnique({
                where : {
                    id : budget.id
                }
            })

            if(!givenBudget){
                throw new Error("budget not found")
            }

            const updatedBudget = await prisma.budget.update({
                where : {
                    id : budget.id
                },
                data : {
                    name: budget.name,
                    icon: budget.icon,
                    startDate: givenBudget.startDate,
                    endDate: budget.endDate,
                    amount: budget.amount,
                    spent: givenBudget.spent,
                    addSpendingDate: givenBudget.addSpendingDate,
                    timePeriod: budget.timePeriod,
                    updatedAt: new Date()
                }
            })
            revalidatePath("/budget")
}