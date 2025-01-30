"use server"

import { prisma } from "@/lib/prisma";
import { createBudgetSchema, CreateBudgetSchemaType } from "@/schema/budget";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function CreateBudget(data : CreateBudgetSchemaType){
     const user =await currentUser()
        if(!user){
            redirect("/sign-in")
        }
    const parsedBody = createBudgetSchema.safeParse(data)

        if(!parsedBody.success){
            throw new Error("parsing error")
        }

       await prisma.budget.create({
            data : {
                userId : user.id,
                name : parsedBody.data.name,
                icon : parsedBody.data.icon,
                timePeriod : parsedBody.data.timePeriod,
                endDate : parsedBody.data.endDate,
                amount : parsedBody.data.amount,
            }
        })

        revalidatePath("/budget")
}