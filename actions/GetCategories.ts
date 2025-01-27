"use server"

import { prisma } from "@/lib/prisma"
import { TransactionType } from "@/lib/types"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { z } from "zod"

export async function GetCategories(type : TransactionType){
    const user = await currentUser()
    
    if(!user){
        redirect("/sign-in")
    }
    const validator = z.enum(["expense", "income"])

    const {success ,data , error} = validator.safeParse(type)

    if(!success){
       throw new Error("Safe parse error",error)
    }
    const categories = await prisma.category.findMany({
        where : {
            userId : user.id,
            ...(type && { type : type}) // include type in the fielders if it's defined
        },
        orderBy : {
            name : "asc"
        }
    })
    
    return categories
}