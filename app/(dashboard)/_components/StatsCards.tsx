"use client"
import { DateToUTCDate, GetFormatterCurrency } from "@/lib/helpers/date"
import { GetDateRangeStats } from '@/actions/GetDateRangeStats'
import { UserSettings } from '@/prisma/generate/client'
import { useQuery } from '@tanstack/react-query'
import React, { ReactNode, useCallback, useMemo } from 'react'
import SkeletonWrapper from "@/components/SkeletonWrapper"
import { TrendingDown, TrendingUp, Wallet } from "lucide-react"
import CountUp from 'react-countup';
import { Card } from "@/components/ui/card"
interface Props {
  userSettings: UserSettings,
  from: Date,
  to: Date
}
const StatsCards = ({ userSettings, from, to }: Props) => {
  const UTCFrom = DateToUTCDate(from)
  const UTCTo = DateToUTCDate(to)
  const statsQuery = useQuery({
    queryKey: ["overview", "stats", from, to],
    queryFn: () => GetDateRangeStats(UTCFrom, UTCTo)
  })
  const formatter = useMemo(() => {
    return GetFormatterCurrency(userSettings.currency)
  }, [userSettings.currency])

  const income = statsQuery.data?.income || 0
  const expense = statsQuery.data?.expense || 0

  const balance = income - expense
  return (
    <div className="relative flex  gap-2 md:flex-nowrap ">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter} value={income} title="Income" icon={<TrendingUp className="h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10" />}
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter} value={expense} title="Expense" icon={<TrendingDown className="h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10" />}
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter} value={balance} title="Balance" icon={<Wallet className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />}
        />
      </SkeletonWrapper>
    </div>
  )
}
function StatCard({ formatter, value, title, icon }: { formatter: Intl.NumberFormat, value: number, title: string, icon: ReactNode }) {
  const formatFn = useCallback((value : number)=>{
    return formatter.format(value)
  },[formatter])
  return (
    <Card className="flex h-24 w-full items-center gap-2 p-4">
      {icon}
      <div className="flex flex-col items-start gap-0">
        <p className="text-muted-foreground">{title}</p>
        <CountUp preserveValue redraw={false} end={value} decimal="2" formattingFn={formatFn} className="text-2xl " />
      </div>
    </Card>
  )
}

export default StatsCards