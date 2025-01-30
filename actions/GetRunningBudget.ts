"use server"

import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"


export async function GetRunningBudget(){
    const user = await currentUser()
        
        if(!user){
            redirect("/sign-in")
        }

        const budget = await prisma.budget.findMany({
            where : {
                userId : user.id,
                endDate : {
                    gte : new Date()
                }
                
            }
        })
        
        return budget
}