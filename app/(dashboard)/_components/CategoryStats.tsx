"use client"

import { getCategoriesStatsReturnType } from '@/app/api/stats/categories/route'
import SkeletonWrapper from '@/components/SkeletonWrapper'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DateToUTCDate, GetFormatterCurrency } from '@/lib/helpers/date'
import { TransactionType } from '@/lib/types'
import { UserSettings } from '@/prisma/generate/client'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'
interface Props {
    userSettings : UserSettings
    from : Date
    to : Date
}

const CategoryStats = ({userSettings ,from ,to} : Props) => {
    const statsQuery = useQuery<getCategoriesStatsReturnType>({
        queryKey : ["overview" , "stats" , "categories" , from ,to],
        queryFn : ()=> fetch(`/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then((res)=> res.json())
    })
    const formatter = useMemo(()=>{
        return GetFormatterCurrency(userSettings.currency)
    },[userSettings.currency])
  return (
    <div className='flex w-full flex-wrap gap-2 md:flex-nowrap'>
        <SkeletonWrapper isLoading={statsQuery.isFetching}>
            <CategoriesCard formatter={formatter} type="income" data={statsQuery.data || []} />
        </SkeletonWrapper>
        <SkeletonWrapper isLoading={statsQuery.isFetching}>
            <CategoriesCard formatter={formatter} type="expense" data={statsQuery.data || []} />
        </SkeletonWrapper>
    </div>
  )
}

function CategoriesCard({formatter ,type , data}: {formatter : Intl.NumberFormat, type: TransactionType , data: getCategoriesStatsReturnType }){
    const filteredData = data.filter(el => el.type ===type)
    const total = filteredData.reduce((acc,el)=> acc+ (el._sum.amount|| 0 ), 0)
    return (
        <Card className='h-80 w-full'>
            <CardHeader>
                <CardTitle className='grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col'>{
                    type==="income" ? "Incomes" : "Expenses"}</CardTitle>
            </CardHeader>
            <div className='flex items-center justify-between gap-2'>
                {
                    filteredData.length === 0 && (
                        <div className='flex h-60 w-full flex-col items-center justify-center'>
                                <p className='text-sm text-muted-foreground'>No data for the selected period or try adding new{" "} {type === "income" ? "income" : "expense"}</p>
                        </div>
                    )
                }
                {
                    filteredData.length> 0 && (
                        <ScrollArea className='h-60 w-full px-4'> 
                            <div className="flex w-full flex-col gap-4 p-4">
                                {
                                    filteredData.map((item)=>{
                                        const amount = item._sum.amount || 0
                                        const percentage = (amount * 100) / (total || amount)
                                        return (
                                            <div  key={item.category} className='flex flex-col gap-2'>

                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center text-gray-400">
                                                    {item.categoryIcon} {item.category}
                                                    <span className='ml-2 text-xs text-muted-foreground'>
                                                        ({percentage.toFixed(0)} %)
                                                    </span>
                                                </span>
                                                <span className="text-sm text-gray-400" >{formatter.format(amount)}
                                                </span>
                                            </div>
                                            <Progress value={percentage} indicator={type === "income" ? "bg-emerald-500" : "bg-red-500" } />
                                        </div>
                                        )
                                    })
                                }
                            </div>
                        </ScrollArea>
                    )
                }
            </div>
        </Card>
    )
}

export default CategoryStats