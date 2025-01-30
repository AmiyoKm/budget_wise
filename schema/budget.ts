import { z } from "zod";



export const createBudgetSchema = z.object({
    name : z.coerce.string().min(3).max(40),
    icon : z.string().max(20),
    endDate : z.date(),
    amount : z.coerce.number().min(0),
    timePeriod : z.enum(["MONTH" , "WEEK" , "YEAR" , "CUSTOM"])
})

export type CreateBudgetSchemaType = z.infer<typeof  createBudgetSchema> 




export const addSpendingSchema = z.object({
    amount: z.coerce.number(),
  });
  