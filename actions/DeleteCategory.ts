"use server"

import { prisma } from "@/lib/prisma";
import { DeleteCategorySchema, DeleteCategorySchemaType } from "@/schema/Category";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function DeleteCategory(form : DeleteCategorySchemaType){
      const user = await currentUser()
    
        if(!user){
            redirect("/sign-in")
        }
        const parsedBody = DeleteCategorySchema.safeParse(form)

        if(!parsedBody.success){
            throw new Error("Parsed body error", parsedBody.error)
        }
        
        const categories = await prisma.category.delete({
            where : {
               name_userId_type : {
                userId : user.id,
                name : parsedBody.data.name,
                type : parsedBody.data.type
               }

            }
        })

        revalidatePath("/manage")
    return categories
}