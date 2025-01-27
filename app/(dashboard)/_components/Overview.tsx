"use client"

import { DateRangePicker } from '@/components/ui/date-range-picker'
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants'
import { UserSettings } from '@/prisma/generate/client'
import { differenceInDays, startOfMonth } from 'date-fns'
import React, { useState } from 'react'
import { toast } from 'sonner'
import StatsCards from './StatsCards'
import CategoryStats from './CategoryStats'

const Overview = ({userSettings}: {userSettings : UserSettings}) => {
    const [dateRange ,setDateRange] = useState<{from : Date, to : Date}>({
        from : startOfMonth(new Date()), to :new Date()
    })
  return (
    <>
    <div className='max-w-full mx-6 flex flex-wrap items-end justify-between gap-2 py-6'>
        <div className="text-3xl font-bold ">Overview</div>
        <div className="flex items-center gap-3">
            <DateRangePicker initialDateFrom={dateRange.from} 
            initialDateTo={dateRange.to} showCompare={false} onUpdate={values=>{
                const {from ,to} = values.range
                
                if(!from || !to) return
                if(differenceInDays(from , to) >= MAX_DATE_RANGE_DAYS){
                    toast.error(`The selected data range is too big. Max allowed range is ${MAX_DATE_RANGE_DAYS} days!`)
                    return
                }
                setDateRange({from , to})
            }}
            />
        </div>
    </div>
    <div className='max-w-full mx-6 flex flex-col gap-2'>

    <StatsCards userSettings={userSettings} from={dateRange.from} to={dateRange.to} />
    <CategoryStats userSettings={userSettings} from={dateRange.from} to={dateRange.to} />
    </div>
            </>
  )
}

export default Overview