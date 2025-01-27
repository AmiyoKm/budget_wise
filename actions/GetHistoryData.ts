"use server"

import { prisma } from "@/lib/prisma"
import { Period, TimeFrame } from "@/lib/types"
import { currentUser } from "@clerk/nextjs/server"
import { getDaysInMonth } from "date-fns"
import { redirect } from "next/navigation"
import { z } from "zod"

const getHistoryDataSchema = z.object({
    timeFrame : z.enum(["month" , "year"]),
    month : z.coerce.number().min(0).max(11).default(0),
    year : z.coerce.number().min(2000).max(3000)
})

export async function GetHistory(timeFrame : TimeFrame , year: number , month :number){
    const user = await currentUser()

    if(!user){
        redirect("/sign-in")
    }
    const parsedBody = getHistoryDataSchema.safeParse({timeFrame , month, year})

    if(!parsedBody.success){
        throw new Error("parsed body error" , parsedBody.error)
    }

    const data = await getHistoryData(user.id ,parsedBody.data.timeFrame , {
        month : parsedBody.data.month,
        year : parsedBody.data.year,

    } )
    return data
}

export type GetHistoryDataResponseType = Awaited<ReturnType<typeof getHistoryData>>
async function getHistoryData(userId : string , timeFrame : TimeFrame , period : Period ){
    switch(timeFrame) {
        case "year" : 
        return await getYearHistoryData(userId , period.year)
        case "month" : 
        return await getMonthHistoryData(userId , period.month , period.year)
    }
}
type HistoryData = {
    expense : number ,
    income : number,
    year : number ,
    month : number,
    day? : number
}

async function getYearHistoryData(userId : string, year : number){
    const result = await prisma.yearHistory.groupBy({
        by : ["month"],
        where : {
            userId,
            year
        },
        _sum : {
            expense :true,
            income :true
        },
        orderBy : [{
            month : "asc",
            
        }]
    })
    if(!result || result.length===0) return []
    let history  : HistoryData[] =[]

    for(let i=0;i<12 ; i++){
        let expense = 0
        let income = 0

        const month = result.find((row)=> row.month ===i)
        if(month){
            expense = month._sum.expense || 0
            income = month._sum.income || 0
        }
        history.push({
            year,
            month : i,
            income,
            expense
        })

    }
    return history
}

async function getMonthHistoryData(userId : string , month :number , year: number){
    const result = await prisma.monthHistory.groupBy({
        by : "day",
        where : {
            userId ,
            month,
            year
        },
        _sum :{
            income :true,
            expense : true
        },
        orderBy :[
            {
                day :"asc"
            }
        ]
    })
    if(!result || result.length===0) return []

    let History : HistoryData[] = []
    const daysInMonth = getDaysInMonth(new Date(year , month))
    for(let i = 1 ; i<=daysInMonth; i++){
        let expense = 0
        let income = 0

        let  day = result.find((row)=> row.day ===i)

        if(day){
            expense = day._sum.expense || 0
            income = day._sum.income || 0
        }
        History.push({
            day : i ,
            month,
            year,
            expense ,
            income
        })
    }
    return History
}