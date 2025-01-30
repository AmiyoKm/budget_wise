"use server"

import { prisma } from "@/lib/prisma";
import { addSpendingSchema } from "@/schema/budget";
import { currentUser } from "@clerk/nextjs/server";
import { Budget } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";


export async function AddSpendingToBudget({data ,budget} : { data : z.infer<typeof addSpendingSchema> , budget : Budget}){
     const user =await currentUser()
            if(!user){
                redirect("/sign-in")
            }
        const parsedBody = addSpendingSchema.safeParse(data)
    
            if(!parsedBody.success){
                throw new Error("parsing error")
            }

            const foundBudget = await prisma.budget.findUnique({
                where : {
                    userId_name_icon : {
                        userId : user.id,
                        name : budget.name,
                        icon : budget.icon
                    }
                }
            })
            if(!foundBudget){
                throw new Error("budget not found")
            }

            await prisma.budget.update({
                where : {
                    userId_name_icon : {
                        userId : user.id,
                        name : foundBudget.name,
                        icon : foundBudget.icon
                    }
                },
                data: {
                    spent: {
                        increment: data.amount
                    },
                    addSpendingDate : new Date()
                }
            })
            revalidatePath("/budget")
}