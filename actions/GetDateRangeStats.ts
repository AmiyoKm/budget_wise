"use server"
import { prisma } from "@/lib/prisma"
import {OverviewQuerySchema} from "@/schema/Overview"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
export async function GetDateRangeStats(from : Date , to : Date ){
    const user = await currentUser()

    if(!user){
        redirect("/sign-in")
    }

    const parsedBody = OverviewQuerySchema.safeParse({from,to})

    if(!parsedBody.success){
        throw new Error("safe parse error", parsedBody.error)
    }

    const stats =await getBalanceStats(user.id , from , to)

    return stats

}
export type GetBalanceStatsResponseType = Awaited<ReturnType<typeof getBalanceStats>>
export async function getBalanceStats(userId : string , from : Date , to : Date){
    const totals = await prisma.transaction.groupBy({
        by : ["type"],
        where :{
            userId,
            date :{
                gte : from,
                lte  :to
            }
            
        },
        _sum : {
            amount : true
        }
    })
    return {
        expense : totals.find(t=> t.type === "expense")?._sum.amount || 0,
        income : totals.find(t=> t.type === "income")?._sum.amount || 0
    }
}