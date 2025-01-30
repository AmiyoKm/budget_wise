"use server"

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { Budget } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export async function DeleteBudget(budget : Budget){
    const user = await currentUser()
    
        if(!user){
            redirect("/sign-in")
        }
        await prisma.budget.delete({
            where : {
                userId_name_icon : {
                    userId : user.id,
                    name : budget.name,
                    icon : budget.icon
                }
            }
        })
        revalidatePath("/budget")
}