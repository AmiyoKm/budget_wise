import { Wallet } from 'lucide-react'
import React from 'react'

const Logo = () => {
  return (
    <div className='flex items-center gap-2'>
        <Wallet className='stroke h-11 w-11 stroke-amber-500 stroke-[1.5]' />
        <p className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text  text-3xl font-bold leading-tight tracking-tighter text-transparent">BudgetWise</p>
    </div>
  )
}
export const LogoMobile = () => {
    return (
      <div className='flex items-center gap-2'>
          <p className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text  text-3xl font-bold leading-tight tracking-tighter text-transparent">BudgetWise</p>
      </div>
    )
  }

export default Logo