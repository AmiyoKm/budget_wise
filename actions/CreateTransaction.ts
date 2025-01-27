"use server"

import { prisma } from "@/lib/prisma"
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/Transaction"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"



export async function CreateTransaction(form : CreateTransactionSchemaType){
    const parsedBody = CreateTransactionSchema.safeParse(form)

    if(!parsedBody.success){
        throw new Error ("Parsed body error", parsedBody.error)
    }
    const user =await currentUser()
    if(!user){
        redirect("/sign-in")
    }

    const {amount , category , description , type , date} = parsedBody.data

    const categoryRow = await prisma.category.findFirst({
        where : {
            userId : user.id,
            name : category
        }
    })
    if(!categoryRow){
        throw new Error("category not found")
    }
    try {
        await prisma.$transaction([
            prisma.transaction.create({
                data :{
                    userId : user.id,
                    amount ,
                    date ,
                    description : description || "",
                    type,
                    category : categoryRow.name,
                    categoryIcon :categoryRow.icon
                }
            }),
            prisma.monthHistory.upsert({
                where : {
                    day_month_year_userId : {
                        userId : user.id,
                        day : date.getUTCDate(),
                        month : date.getUTCMonth(),
                        year : date.getUTCFullYear()
                    }
                },
                create : {
                    userId : user.id,
                        day : date.getUTCDate(),
                        month : date.getUTCMonth(),
                        year : date.getUTCFullYear(),
                        expense : type ==="expense" ? amount : 0,
                        income : type ==="income" ? amount : 0,
                },
                update : {
                    expense : {
                        increment : type === "expense" ? amount : 0,
                    },
                    income  : {
                        increment : type === "income" ? amount : 0
                    }
                }
            }),
            prisma.yearHistory.upsert({
                where : {
                    month_year_userId : {
                        userId : user.id,
                        month : date.getUTCMonth(),
                        year : date.getUTCFullYear()
                    }
                },
                create : {
                    userId : user.id,
                        month : date.getUTCMonth(),
                        year : date.getUTCFullYear(),
                        expense : type ==="expense" ? amount : 0,
                        income : type ==="income" ? amount : 0,
                },
                update : {
                    expense : {
                        increment : type === "expense" ? amount : 0
                    },
                    income  : {
                        increment : type === "income" ? amount : 0
                    }
                }
            })
        ])
        revalidatePath("/")
    } catch (error) {
        console.error("Transaction error:", error);
        throw new Error("Database transaction failed");
    }
}