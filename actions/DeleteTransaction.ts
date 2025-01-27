"use server"

import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"


export async function DeleteTransaction(TransactionId: string) {

    const user = await currentUser()
    if (!user) {
        redirect("/sign-in")
    }

    try {
        const transaction = await prisma.transaction.findUnique({
            where: {
                userId: user.id,
                id: TransactionId
            }
        })
        if (!transaction) {
            throw new Error("bad request")
        }
        return await prisma.$transaction([
            prisma.transaction.delete({
                where: {
                    id: TransactionId,
                    userId: user.id
                }
            }),
            prisma.monthHistory.update({
                where: {
                    day_month_year_userId: {
                        userId: user.id,
                        day: transaction.date.getUTCDate(),
                        month: transaction.date.getUTCMonth(),
                        year: transaction.date.getUTCFullYear()
                    }
                },
                data: {
                    ...(transaction.type === "expense" && {
                        expense: {
                            decrement: transaction.amount
                        }
                    }),
                    ...(transaction.type === "income" && {
                        income: {
                            increment: transaction.amount
                        }
                    })

                }
            }),
            prisma.yearHistory.update({
                where: {
                    month_year_userId: {
                        userId: user.id,
                        month: transaction.date.getUTCMonth(),
                        year: transaction.date.getUTCFullYear()
                    }
                },
                data: {
                    ...(transaction.type === "expense" && {
                        expense: {
                            decrement: transaction.amount
                        }
                    }),
                    ...(transaction.type === "income" && {
                        income: {
                            increment: transaction.amount
                        }
                    })

                }
            })
        ])

    } catch (error) {
        console.error("Transaction error:", error);
        throw new Error("Database transaction failed");
    }
}