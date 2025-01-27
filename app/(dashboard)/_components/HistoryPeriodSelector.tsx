"use client"

import { GetHistoryPeriodsReturnType } from '@/app/api/history-periods/route'
import SkeletonWrapper from '@/components/SkeletonWrapper'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Period, TimeFrame } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
interface Props {
    period : Period
    setPeriod : (period : Period)=> void
    timeFrame : TimeFrame
    setTimeFrame : (timeFrame: TimeFrame)=> void
}
const HistoryPeriodSelector = ({period , setPeriod, setTimeFrame ,timeFrame } : Props) => {
    const historyPeriods = useQuery<GetHistoryPeriodsReturnType>({
        queryKey : ["overview" , "history" , "periods"],
        queryFn : ()=> fetch("/api/history-periods").then(res => res.json()),
    })
  return (
    <div className="flex flex-wrap items-center gap-4">
        <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
            <Tabs value={timeFrame} onValueChange={(value)=> setTimeFrame(value as TimeFrame)}>
                <TabsList>
                    <TabsTrigger value='year'>Year</TabsTrigger>
                    <TabsTrigger value='month'>Month</TabsTrigger>
                </TabsList>
            </Tabs>
        </SkeletonWrapper>
        <div className='flex flex-wrap items-center gap-2' >
            <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
                <YearsSelector period={period} setPeriod={setPeriod} years={historyPeriods.data || []} />
            </SkeletonWrapper>
            {
                timeFrame === "month" && (
                    <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
                         <MonthSelector period={period} setPeriod={setPeriod}  />
                    </SkeletonWrapper>
                )
            }
        </div>
    </div>
  )
}
function YearsSelector({period , setPeriod , years}: {period : Period , setPeriod : (period : Period)=> void , years : GetHistoryPeriodsReturnType}){
    return (
        <Select value={period.year.toString()} onValueChange={(value)=> {
            setPeriod({
                month : period.month,
                year : parseInt(value)
            })
        }}>
            <SelectTrigger className='w-[180px]'>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {
                    years.map((year)=>(
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))
                }
            </SelectContent>
        </Select>
    )
}

function MonthSelector({period , setPeriod }: {period : Period , setPeriod : (period : Period)=> void }){
    return (
        <Select value={period.month.toString()} onValueChange={(value)=> {
            setPeriod({
                year : period.year,
                month : parseInt(value)
            })
        }}>
            <SelectTrigger className='w-[180px]'>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {
                   [...Array(12)].map((_, i : number)=>{
                    const month = i
                    const monthStr = new Date(period.year , month ,1).toLocaleString("default", {
                        month : "long"
                    })
                    return (

                        <SelectItem key={month} value={month.toString()}>{monthStr}</SelectItem>
                    )
                   })
                }
            </SelectContent>
        </Select>
    )
}

export default HistoryPeriodSelector